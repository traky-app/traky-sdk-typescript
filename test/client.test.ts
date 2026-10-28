import { describe, expect, it } from "vitest";
import { Traky, TrakyApiError, TrakyError } from "../src/index.js";

const organization = {
  id: "ent_1",
  name: "Demo",
  slug: "demo",
  enterpriseCode: "DM",
  countryCode: "EC",
  currency: "USD",
  organizationId: "org_1",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Traky", () => {
  it("exige api key", () => {
    expect(() => new Traky({ apiKey: "   " })).toThrow(TrakyError);
  });

  it("pide la organización con Bearer y sin barra final", async () => {
    let url = "";
    let authorization: string | null = null;
    let userAgent: string | null = null;

    const client = new Traky({
      apiKey: "trk_test",
      baseUrl: "https://api.traky.app/",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        url = request.url;
        authorization = request.headers.get("authorization");
        userAgent = request.headers.get("user-agent");
        return jsonResponse(organization);
      },
    });

    await expect(client.organization.retrieve()).resolves.toEqual(organization);
    expect(url).toBe("https://api.traky.app/org-api/v1/organization");
    expect(authorization).toBe("Bearer trk_test");
    expect(userAgent).toMatch(/^@traky-app\/sdk\//);
  });

  it("solo llama organización, todos los paquetes y paquetes de Misiil", async () => {
    const paths: string[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input) => {
        const request = new Request(input);
        paths.push(`${request.method} ${new URL(request.url).pathname}`);
        return jsonResponse({
          data: [],
          total: 0,
          exportedAt: "2026-10-24T00:00:00.000Z",
          source: "misiil",
        });
      },
    });

    expect(Object.keys(client).sort()).toEqual([
      "contacts",
      "customers",
      "offices",
      "organization",
      "packages",
      "receipts",
      "statuses",
      "warehouses",
    ]);
    expect(
      Object.getOwnPropertyNames(Object.getPrototypeOf(client.organization))
        .filter((name) => name !== "constructor")
        .sort(),
    ).toEqual(["retrieve"]);
    expect(
      Object.getOwnPropertyNames(Object.getPrototypeOf(client.packages))
        .filter((name) => name !== "constructor")
        .sort(),
    ).toEqual(["create", "delete", "list", "listFromMisiil", "retrieve", "update"]);

    await client.organization.retrieve();
    await client.packages.list();
    await client.packages.listFromMisiil();
    expect(paths.sort()).toEqual([
      "GET /org-api/v1/marketplaces/misiil/packages",
      "GET /org-api/v1/organization",
      "GET /org-api/v1/packages",
    ]);
  });

  it("exporta paquetes y paquetes de Misiil", async () => {
    const paths: string[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input) => {
        const request = new Request(input);
        paths.push(new URL(request.url).pathname);
        if (request.url.endsWith("/marketplaces/misiil/packages")) {
          return jsonResponse({
            data: [],
            total: 0,
            exportedAt: "2026-10-24T00:00:00.000Z",
            source: "misiil",
          });
        }
        return jsonResponse({
          data: [],
          total: 0,
          exportedAt: "2026-10-24T00:00:00.000Z",
        });
      },
    });

    await client.packages.list();
    const misiil = await client.packages.listFromMisiil();
    expect(paths).toEqual([
      "/org-api/v1/packages",
      "/org-api/v1/marketplaces/misiil/packages",
    ]);
    expect(misiil.source).toBe("misiil");
  });

  it("recorre todas las funciones del SDK", async () => {
    const calls: { method: string; url: string }[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        const url = new URL(request.url);
        calls.push({
          method: request.method,
          url: `${url.pathname}${url.search}`,
        });
        return jsonResponse({
          id: "res_1",
          data: [],
          total: 0,
          exportedAt: "2026-10-27T00:00:00.000Z",
          source: "misiil",
          pagination: { limit: 50 },
          deleted: true,
          deletedCount: 1,
        });
      },
    });

    await client.organization.retrieve();
    await client.statuses.list();
    await client.statuses.list({ category: "package" });
    await client.offices.list();
    await client.warehouses.list();
    await client.packages.list();
    await client.packages.listFromMisiil();
    await client.packages.retrieve("pkg_1");
    await client.packages.create({
      registrationDate: "2026-10-27T00:00:00.000Z",
      trackingNumber: "1Z999",
      itemStatusId: "st_1",
      locationId: "loc_1",
    });
    await client.packages.update("pkg_1", { warehouseComments: "Nota" });
    await client.packages.delete("pkg_1");
    await client.receipts.list();
    await client.receipts.retrieve("pkg_1");
    await client.receipts.create({
      registrationDate: "2026-10-27T00:00:00.000Z",
      locationId: "loc_1",
      itemStatusId: "st_1",
      packages: [{ trackingNumber: "1Z111" }],
    });
    await client.receipts.update("pkg_1", { comments: "Ropa" });
    await client.receipts.delete("pkg_1");
    await client.customers.list();
    await client.customers.retrieve("cus_1");
    await client.customers.create({ firstName: "Ana", createContact: false });
    await client.customers.update("cus_1", { lastName: "Paz" });
    await client.customers.delete("cus_1");
    await client.contacts.list();
    await client.contacts.retrieve("con_1");
    await client.contacts.create({ firstName: "Luis", types: ["SHIPPER"] });
    await client.contacts.update("con_1", { types: ["CONSIGNEE"] });
    await client.contacts.delete("con_1");

    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "GET /org-api/v1/organization",
      "GET /org-api/v1/statuses",
      "GET /org-api/v1/statuses?category=package",
      "GET /org-api/v1/offices",
      "GET /org-api/v1/offices?type=warehouse",
      "GET /org-api/v1/packages",
      "GET /org-api/v1/marketplaces/misiil/packages",
      "GET /org-api/v1/packages/pkg_1",
      "POST /org-api/v1/packages",
      "PATCH /org-api/v1/packages/pkg_1",
      "DELETE /org-api/v1/packages/pkg_1",
      "GET /org-api/v1/receipts",
      "GET /org-api/v1/receipts/pkg_1",
      "POST /org-api/v1/receipts",
      "PATCH /org-api/v1/receipts/pkg_1",
      "DELETE /org-api/v1/receipts/pkg_1",
      "GET /org-api/v1/customers",
      "GET /org-api/v1/customers/cus_1",
      "POST /org-api/v1/customers",
      "PATCH /org-api/v1/customers/cus_1",
      "DELETE /org-api/v1/customers/cus_1",
      "GET /org-api/v1/contacts",
      "GET /org-api/v1/contacts/con_1",
      "POST /org-api/v1/contacts",
      "PATCH /org-api/v1/contacts/con_1",
      "DELETE /org-api/v1/contacts/con_1",
    ]);
  });

  it("hace el CRUD de paquetes y de recibos", async () => {
    const calls: { method: string; url: string; body: string | null }[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        calls.push({
          method: request.method,
          url: `${new URL(request.url).pathname}${new URL(request.url).search}`,
          body: init?.body ? String(init.body) : null,
        });
        return jsonResponse({
          id: "pkg_1",
          deleted: true,
          deletedCount: 2,
          data: [],
          pagination: { limit: 50 },
        });
      },
    });

    expect(
      Object.getOwnPropertyNames(Object.getPrototypeOf(client.receipts))
        .filter((name) => name !== "constructor")
        .sort(),
    ).toEqual(["create", "delete", "list", "retrieve", "update"]);

    await client.packages.retrieve("pkg 1");
    await client.packages.create({
      registrationDate: "2026-10-27T00:00:00.000Z",
      trackingNumber: "1Z999",
      itemStatusId: "st_1",
      locationId: "loc_1",
    });
    await client.packages.update("pkg_1", { warehouseComments: "Retener" });
    await client.packages.delete("pkg_1");
    await client.receipts.list({ page: 2, trackingNumber: "WR0000008" });
    await client.receipts.retrieve("pkg_1");
    await client.receipts.create({
      registrationDate: "2026-10-27T00:00:00.000Z",
      locationId: "loc_1",
      itemStatusId: "st_1",
      packages: [{ trackingNumber: "1Z111" }, { trackingNumber: "1Z222" }],
    });
    await client.receipts.update("pkg_1", {
      warehouseComments: "Frágil",
      packages: [{ id: "pkg_2", weight: 4 }],
    });
    await client.receipts.delete("pkg_1");

    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "GET /org-api/v1/packages/pkg%201",
      "POST /org-api/v1/packages",
      "PATCH /org-api/v1/packages/pkg_1",
      "DELETE /org-api/v1/packages/pkg_1",
      "GET /org-api/v1/receipts?page=2&trackingNumber=WR0000008",
      "GET /org-api/v1/receipts/pkg_1",
      "POST /org-api/v1/receipts",
      "PATCH /org-api/v1/receipts/pkg_1",
      "DELETE /org-api/v1/receipts/pkg_1",
    ]);
    expect(calls[1]?.body).toBe(
      JSON.stringify({
        registrationDate: "2026-10-27T00:00:00.000Z",
        trackingNumber: "1Z999",
        itemStatusId: "st_1",
        locationId: "loc_1",
      }),
    );
    expect(calls[6]?.body).toContain('"trackingNumber":"1Z111"');
    expect(calls[7]?.body).toBe(
      JSON.stringify({
        warehouseComments: "Frágil",
        packages: [{ id: "pkg_2", weight: 4 }],
      }),
    );
  });

  it("hace el CRUD de clientes y contactos", async () => {
    const calls: { method: string; url: string; body: string | null }[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        calls.push({
          method: request.method,
          url: `${new URL(request.url).pathname}${new URL(request.url).search}`,
          body: init?.body ? String(init.body) : null,
        });
        return jsonResponse({
          id: "cus_1",
          data: [],
          pagination: { limit: 50 },
          deleted: true,
        });
      },
    });

    expect(
      Object.getOwnPropertyNames(Object.getPrototypeOf(client.customers))
        .filter((name) => name !== "constructor")
        .sort(),
    ).toEqual(["create", "delete", "list", "retrieve", "update"]);
    expect(
      Object.getOwnPropertyNames(Object.getPrototypeOf(client.contacts))
        .filter((name) => name !== "constructor")
        .sort(),
    ).toEqual(["create", "delete", "list", "retrieve", "update"]);

    await client.customers.list({
      page: 2,
      isActive: true,
      types: ["CLIENT", "SHIPPER"],
    });
    await client.customers.retrieve("cus 1");
    await client.customers.create({ firstName: "Ana" });
    await client.customers.update("cus_1", { lastName: "Paz" });
    await client.customers.delete("cus_1");
    await client.contacts.list({ linked: false, clientId: "cus_1" });
    await client.contacts.create({ firstName: "Luis", clientId: "cus_1" });
    await client.contacts.update("con_1", { clientId: null });
    await client.contacts.retrieve("con_1");
    await client.contacts.delete("con_1");

    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "GET /org-api/v1/customers?page=2&isActive=true&types=CLIENT%2CSHIPPER",
      "GET /org-api/v1/customers/cus%201",
      "POST /org-api/v1/customers",
      "PATCH /org-api/v1/customers/cus_1",
      "DELETE /org-api/v1/customers/cus_1",
      "GET /org-api/v1/contacts?linked=false&clientId=cus_1",
      "POST /org-api/v1/contacts",
      "PATCH /org-api/v1/contacts/con_1",
      "GET /org-api/v1/contacts/con_1",
      "DELETE /org-api/v1/contacts/con_1",
    ]);
    expect(calls[2]?.body).toBe(JSON.stringify({ firstName: "Ana" }));
    expect(calls[7]?.body).toBe(JSON.stringify({ clientId: null }));
  });

  it("traduce el error de Nest", async () => {
    const client = new Traky({
      apiKey: "trk_invalid",
      fetch: async () =>
        jsonResponse(
          {
            statusCode: 401,
            message: "API key inválida, revocada o sin empresa vinculada",
            error: "Unauthorized",
          },
          401,
        ),
    });

    await expect(client.organization.retrieve()).rejects.toMatchObject({
      name: "TrakyApiError",
      status: 401,
      message: "API key inválida, revocada o sin empresa vinculada",
    });
    await expect(client.organization.retrieve()).rejects.toBeInstanceOf(
      TrakyApiError,
    );
  });

  it("no deja que un header extra reemplace Authorization", async () => {
    let authorization: string | null = null;
    let contentType: string | null = null;
    const client = new Traky({
      apiKey: "trk_test",
      headers: {
        Authorization: "Bearer otro",
        "Content-Type": "text/plain",
        "X-Request-Id": "req_1",
      },
      fetch: async (input, init) => {
        const request = new Request(input, init);
        authorization = request.headers.get("authorization");
        contentType = request.headers.get("content-type");
        expect(request.headers.get("x-request-id")).toBe("req_1");
        return jsonResponse({ id: "pkg_1" });
      },
    });

    await client.packages.create({
      registrationDate: "2026-10-27T00:00:00.000Z",
      trackingNumber: "1Z999",
      itemStatusId: "st_1",
      locationId: "loc_1",
      receiptSerialNumber: 1204,
      receiptPackageIndex: 2,
    });
    expect(authorization).toBe("Bearer trk_test");
    expect(contentType).toBe("application/json");
  });

  it("agrega P2 a un recibo y borra solo ese paquete", async () => {
    const calls: { method: string; url: string; body: string | null }[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        calls.push({
          method: request.method,
          url: new URL(request.url).pathname,
          body: init?.body ? String(init.body) : null,
        });
        if (request.method === "DELETE") {
          return jsonResponse({ id: "pkg_2", deleted: true });
        }
        return jsonResponse({
          id: "pkg_2",
          packageNumber: "WR00001204P2",
          receiptNumber: "WR00001204",
        });
      },
    });

    const created = await client.packages.create({
      registrationDate: "2026-10-27T00:00:00.000Z",
      trackingNumber: "1Z222",
      itemStatusId: "st_1",
      locationId: "loc_1",
      receiptSerialNumber: 1204,
      receiptPackageIndex: 2,
      weight: 3,
      comments: "Ropa",
    });
    const removed = await client.packages.delete(created.id);

    expect(created.packageNumber).toBe("WR00001204P2");
    expect(removed).toEqual({ id: "pkg_2", deleted: true });
    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "POST /org-api/v1/packages",
      "DELETE /org-api/v1/packages/pkg_2",
    ]);
    expect(calls[0]?.body).toBe(
      JSON.stringify({
        registrationDate: "2026-10-27T00:00:00.000Z",
        trackingNumber: "1Z222",
        itemStatusId: "st_1",
        locationId: "loc_1",
        receiptSerialNumber: 1204,
        receiptPackageIndex: 2,
        weight: 3,
        comments: "Ropa",
      }),
    );
    expect(calls[1]?.body).toBeNull();
  });

  it("lista estados, sucursales y bodegas", async () => {
    const paths: string[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input) => {
        const request = new Request(input);
        const url = new URL(request.url);
        paths.push(`${request.method} ${url.pathname}${url.search}`);
        return jsonResponse({ data: [] });
      },
    });

    for (const resource of [client.statuses, client.offices, client.warehouses]) {
      expect(
        Object.getOwnPropertyNames(Object.getPrototypeOf(resource))
          .filter((name) => name !== "constructor")
          .sort(),
      ).toEqual(["list"]);
    }

    await client.statuses.list();
    await client.statuses.list({ category: "shipment" });
    await client.offices.list();
    await client.offices.list({ type: "office" });
    await client.warehouses.list();
    expect(paths).toEqual([
      "GET /org-api/v1/statuses",
      "GET /org-api/v1/statuses?category=shipment",
      "GET /org-api/v1/offices",
      "GET /org-api/v1/offices?type=office",
      "GET /org-api/v1/offices?type=warehouse",
    ]);
  });

  it("falla si la petición expira", async () => {
    const client = new Traky({
      apiKey: "trk_test",
      timeoutMs: 15,
      fetch: (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("The operation was aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    });

    await expect(client.packages.list()).rejects.toThrow(/superó 15 ms/);
  });
});
