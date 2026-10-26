# @traky-app/sdk

SDK de Node.js para la [API de organización de Traky](https://api.traky.app). Autentica con una API key (`trk_…`) y llama a `/org-api/v1`.

Requiere Node.js 20 o superior. No tiene dependencias de runtime: usa `fetch`.

## Instalación

npm o pnpm instalan el mismo paquete público: https://www.npmjs.com/package/@traky-app/sdk

```bash
npm install @traky-app/sdk
```

```bash
pnpm add @traky-app/sdk
```

## Uso

Crea la API key en Traky (ajustes de desarrollador de la empresa) y guárdala en `TRAKY_API_KEY`.

```ts
import { Traky } from "@traky-app/sdk";

const traky = new Traky({
  apiKey: process.env.TRAKY_API_KEY!,
});

const organization = await traky.organization.retrieve();
const packages = await traky.packages.list();
const misiil = await traky.packages.listFromMisiil();

const customers = await traky.customers.list({ page: 1, types: ["CLIENT"] });
const customer = await traky.customers.create({
  firstName: "Ana",
  email: "ana@example.com",
});
await traky.customers.update(customer.id, { lastName: "Paz" });

const contact = await traky.contacts.create({
  firstName: "Luis",
  types: ["SHIPPER"],
  clientId: customer.id,
});
await traky.contacts.delete(contact.id);
```

| Método | Endpoint | Scope |
| --- | --- | --- |
| `organization.retrieve()` | `GET /org-api/v1/organization` | `organization:read` |
| `packages.list()` | `GET /org-api/v1/packages` | `packages:read` |
| `packages.listFromMisiil()` | `GET /org-api/v1/marketplaces/misiil/packages` | `packages:read` |
| `customers.list()` / `customers.retrieve()` | `GET /org-api/v1/customers` | `customers:read` o `organization:read` |
| `customers.create()` / `update()` / `delete()` | `POST`, `PATCH`, `DELETE /org-api/v1/customers` | `customers:write` o `organization:read` |
| `contacts.list()` / `contacts.retrieve()` | `GET /org-api/v1/contacts` | `contacts:read` o `organization:read` |
| `contacts.create()` / `update()` / `delete()` | `POST`, `PATCH`, `DELETE /org-api/v1/contacts` | `contacts:write` o `organization:read` |

`packages.list()` devuelve hasta 500 paquetes, los más recientes. Cada paquete trae `packageType` (`WR`), `receiptNumber` y `packageNumber`. En Misiil el recibo es el warehouse (`WHR…`) y el código de paquete es ese recibo más `P1`. `packages.listFromMisiil()` devuelve solo los paquetes ligados a Misiil y agrega `source: "misiil"`. La nota de bodega va en `warehouseComments` y la descripción en `comments`.

`customers` es el cliente con portal. `contacts` es el contacto comercial (remitente, consignatario, etc.) y puede vincularse con `clientId`. Una cuenta personal pide `firstName`; una cuenta `BUSINESS` pide `companyName`. Las claves ya creadas con `organization:read` pueden usar este CRUD. La respuesta no incluye el id de autenticación ni la contraseña del portal.

La API también acepta la key en el header `X-Api-Key`; este SDK envía `Authorization: Bearer`.

### Entorno local

```ts
const traky = new Traky({
  apiKey: process.env.TRAKY_API_KEY!,
  baseUrl: "http://localhost:4000",
});
```

### Errores

```ts
import { Traky, TrakyApiError } from "@traky-app/sdk";

try {
  await traky.organization.retrieve();
} catch (error) {
  if (error instanceof TrakyApiError) {
    console.error(error.status, error.message, error.body);
  }
}
```

## Desarrollo

```bash
pnpm install
pnpm test
pnpm run typecheck
pnpm run build
```

El build (`tsup`) genera ESM (`dist/index.js`), CommonJS (`dist/index.cjs`) y tipos.

Para añadir un recurso, crea una clase en `src/resources/` y cuélgala de `Traky` en `src/client.ts`. Las peticiones pasan por `TrakyHttp`.

## Publicar

El paquete es público: `@traky-app/sdk`. Se publica en npm cuando se publica un release de GitHub. `npm install` y `pnpm add` usan ese mismo registro. No hace falta un token ni un environment.

Antes del release, deja la misma versión en `package.json` y en `src/version.ts`. El tag tiene que ser esa versión con `v` delante (`v1.2.0` para `1.2.0`). Al publicar el release, el workflow hace checkout de ese tag, comprueba que coincida y sube el paquete si esa versión aún no está en npm. Un borrador no publica.

En npm, la organización `@traky-app` tiene que existir y el workflow tiene que estar autorizado:

- Repositorio: `traky-app/traky-sdk-typescript`
- Workflow: `publish.yml`
- Environment: vacío

`prepublishOnly` corre typecheck, tests y build antes del tarball.
