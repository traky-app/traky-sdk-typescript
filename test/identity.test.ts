import { describe, expect, it } from "vitest";
import { Traky, TrakyError } from "../src/index.js";
import { assertCustomerIdentityWrite, identityKind } from "../src/identity.js";

function clientThatMustNotFetch(): Traky {
  return new Traky({
    apiKey: "trk_test",
    fetch: async () => {
      throw new Error("no debe llamar al API");
    },
  });
}

function clientRecording(): {
  client: Traky;
  bodies: Array<string | null>;
} {
  const bodies: Array<string | null> = [];
  const client = new Traky({
    apiKey: "trk_test",
    fetch: async (_input, init) => {
      bodies.push(init?.body ? String(init.body) : null);
      return new Response(JSON.stringify({ id: "cus_1", types: ["CLIENT"] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  return { client, bodies };
}

describe("identidad del cliente", () => {
  it("clasifica cédula, RUC, pasaporte y el resto", () => {
    expect(identityKind("cedula")).toBe("CEDULA");
    expect(identityKind("EC_CEDULA")).toBe("CEDULA");
    expect(identityKind("Cédula")).toBe("CEDULA");
    expect(identityKind("ruc")).toBe("RUC");
    expect(identityKind("EC_RUC")).toBe("RUC");
    expect(identityKind("PASSPORT")).toBe("PASSPORT");
    expect(identityKind("pasaporte")).toBe("PASSPORT");
    expect(identityKind("DNI")).toBe("OTHER");
    expect(identityKind("")).toBeNull();
    expect(identityKind(undefined)).toBeNull();
  });

  it.each([
    { identityType: "CEDULA", identityNumber: "1710034065", firstName: "Ana" },
    { identityType: "CEDULA", identityNumber: "1710034065", lastName: "Paz" },
    { identityType: "EC_CEDULA", identityNumber: "1710034065", companyName: "ACME" },
    { identityType: "RUC", identityNumber: "1790012345001", companyName: "ACME" },
    { identityType: "RUC", identityNumber: "1790012345001", firstName: "ACME" },
    { identityType: "EC_RUC", identityNumber: "1790012345001", lastName: "Paz" },
  ])("no deja enviar nombres en $identityType", async (body) => {
    const client = clientThatMustNotFetch();
    await expect(client.customers.create(body)).rejects.toBeInstanceOf(TrakyError);
    await expect(client.customers.update("cus_1", body)).rejects.toBeInstanceOf(
      TrakyError,
    );
  });

  it("envía la cédula sola y deja que el API cree el contacto", async () => {
    const { client, bodies } = clientRecording();
    await client.customers.create({
      identityType: "CEDULA",
      identityNumber: "1710-034-065",
      email: "ana@example.com",
    });
    expect(JSON.parse(bodies[0] ?? "{}")).toEqual({
      identityType: "CEDULA",
      identityNumber: "1710-034-065",
      email: "ana@example.com",
    });
  });

  it("puede omitir el contacto automático", async () => {
    const { client, bodies } = clientRecording();
    await client.customers.create({
      identityType: "RUC",
      identityNumber: "1790012345001",
      createContact: false,
    });
    expect(JSON.parse(bodies[0] ?? "{}")).toEqual({
      identityType: "RUC",
      identityNumber: "1790012345001",
      createContact: false,
    });
  });

  it("pide 10 dígitos en la cédula y 13 en el RUC", async () => {
    const client = clientThatMustNotFetch();
    await expect(
      client.customers.create({ identityType: "CEDULA", identityNumber: "171" }),
    ).rejects.toThrow("10 dígitos");
    await expect(
      client.customers.create({ identityType: "RUC" }),
    ).rejects.toThrow("obligatorio");
    await expect(
      client.customers.create({ identityType: "RUC", identityNumber: "179001234500" }),
    ).rejects.toThrow("13 dígitos");
  });

  it("exige nombre y apellido en el pasaporte y no envía razón social", async () => {
    const client = clientThatMustNotFetch();
    await expect(
      client.customers.create({
        identityType: "PASSPORT",
        identityNumber: "A1234567",
      }),
    ).rejects.toThrow("firstName y lastName");
    await expect(
      client.customers.create({
        identityType: "PASAPORTE",
        identityNumber: "A1234567",
        firstName: "Ana",
        lastName: "Paz",
        companyName: "ACME",
      }),
    ).rejects.toThrow("companyName");
    await expect(
      client.customers.create({
        identityType: "PASSPORT",
        identityNumber: "A12",
        firstName: "Ana",
        lastName: "Paz",
      }),
    ).rejects.toThrow("entre 5 y 20");
  });

  it("envía el pasaporte con nombre y apellido", async () => {
    const { client, bodies } = clientRecording();
    await client.customers.create({
      identityType: "PASSPORT",
      identityNumber: "A1234567",
      firstName: "Ana",
      lastName: "Paz",
      email: "ana@example.com",
    });
    expect(JSON.parse(bodies[0] ?? "{}")).toMatchObject({
      identityType: "PASSPORT",
      firstName: "Ana",
      lastName: "Paz",
    });
    expect(JSON.parse(bodies[0] ?? "{}")).not.toHaveProperty("createContact");
  });

  it("deja pasar un DNI y un alta sin documento", async () => {
    const { client, bodies } = clientRecording();
    await client.customers.create({
      identityType: "DNI",
      identityNumber: "12345678",
      firstName: "Ana",
    });
    await client.customers.create({ firstName: "Ana", createContact: true });
    expect(JSON.parse(bodies[0] ?? "{}").firstName).toBe("Ana");
    expect(JSON.parse(bodies[1] ?? "{}")).toEqual({
      firstName: "Ana",
      createContact: true,
    });
  });

  it("en un update sin tipo no bloquea el nombre", () => {
    expect(() =>
      assertCustomerIdentityWrite({ firstName: "Ana" }, "update"),
    ).not.toThrow();
  });

  it("en un update a cédula vuelve a exigir solo el número", async () => {
    const { client, bodies } = clientRecording();
    await client.customers.update("cus_1", {
      identityType: "CEDULA",
      identityNumber: "1710034065",
      city: "Quito",
    });
    expect(JSON.parse(bodies[0] ?? "{}")).toEqual({
      identityType: "CEDULA",
      identityNumber: "1710034065",
      city: "Quito",
    });
  });

  it("trata espacios como nombre vacío en cédula", () => {
    expect(() =>
      assertCustomerIdentityWrite(
        {
          identityType: "CEDULA",
          identityNumber: "1710034065",
          firstName: "   ",
          lastName: "",
          companyName: null,
        },
        "create",
      ),
    ).not.toThrow();
  });
});
