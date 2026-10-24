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

  it("exporta paquetes y paquetes de Misiil", async () => {
    const paths: string[] = [];
    const client = new Traky({
      apiKey: "trk_test",
      fetch: async (input) => {
        const request = new Request(input);
        paths.push(new URL(request.url).pathname);
        if (request.url.endsWith("/bots/misiil/packages")) {
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
      "/org-api/v1/bots/misiil/packages",
    ]);
    expect(misiil.source).toBe("misiil");
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
