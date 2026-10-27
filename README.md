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
import {
  Traky,
  type ContactWrite,
  type CustomerCreate,
} from "@traky-app/sdk";

const traky = new Traky({
  apiKey: process.env.TRAKY_API_KEY!,
});

const organization = await traky.organization.retrieve();
const packages = await traky.packages.list();
const misiil = await traky.packages.listFromMisiil();

const created = await traky.packages.create({
  registrationDate: new Date().toISOString(),
  trackingNumber: "1Z999",
  itemStatusId: "00000000-0000-4000-8000-000000000001",
  locationId: "00000000-0000-4000-8000-000000000002",
  weight: 2,
});
await traky.packages.update(created.id, { warehouseComments: "Retener" });

const receipt = await traky.receipts.create({
  registrationDate: new Date().toISOString(),
  locationId: "00000000-0000-4000-8000-000000000002",
  itemStatusId: "00000000-0000-4000-8000-000000000001",
  packages: [
    { trackingNumber: "1Z111", weight: 1 },
    { trackingNumber: "1Z222", weight: 2 },
  ],
});
await traky.receipts.update(receipt.id, { warehouseComments: "Frágil" });
await traky.receipts.delete(receipt.id);

const customerBody: CustomerCreate = {
  accountType: "PERSONAL",
  firstName: "Ana",
  email: "ana@example.com",
  createContact: false,
};
const customer = await traky.customers.create(customerBody);
await traky.customers.update(customer.id, { lastName: "Paz" });

const contactBody: ContactWrite = {
  firstName: "Luis",
  types: ["SHIPPER"],
  clientId: customer.id,
};
const contact = await traky.contacts.create(contactBody);
await traky.contacts.update(contact.id, { types: ["SHIPPER", "CONSIGNEE"] });
await traky.contacts.delete(contact.id);
```

El ejemplo de cada recurso está en `examples/`: `organization.ts`, `statuses.ts`, `offices.ts`, `warehouses.ts`, `packages.ts`, `receipts.ts`, `customers.ts` y `contacts.ts`. `examples/directory.ts` crea y borra un cliente y un contacto juntos. Al pasar el cursor sobre `create`, `update`, `list`, `retrieve` o `delete` el editor muestra el cuerpo que hay que enviar.

| Método | Endpoint | Scope |
| --- | --- | --- |
| `organization.retrieve()` | `GET /org-api/v1/organization` | `organization:read` |
| `statuses.list()` | `GET /org-api/v1/statuses` | `organization:read`, `packages:read` o `packages:write` |
| `offices.list()` | `GET /org-api/v1/offices` | `organization:read`, `packages:read` o `packages:write` |
| `warehouses.list()` | `GET /org-api/v1/warehouses` | `organization:read`, `packages:read` o `packages:write` |
| `packages.list()` | `GET /org-api/v1/packages` | `packages:read` |
| `packages.retrieve()` | `GET /org-api/v1/packages/:id` | `packages:read` |
| `packages.create()` / `update()` / `delete()` | `POST`, `PATCH`, `DELETE /org-api/v1/packages` | `packages:write` o `organization:read` |
| `packages.listFromMisiil()` | `GET /org-api/v1/marketplaces/misiil/packages` | `packages:read` |
| `receipts.list()` / `receipts.retrieve()` | `GET /org-api/v1/receipts` | `packages:read` |
| `receipts.create()` / `update()` / `delete()` | `POST`, `PATCH`, `DELETE /org-api/v1/receipts` | `packages:write` o `organization:read` |
| `customers.list()` / `customers.retrieve()` | `GET /org-api/v1/customers` | `customers:read` o `organization:read` |
| `customers.create()` / `update()` / `delete()` | `POST`, `PATCH`, `DELETE /org-api/v1/customers` | `customers:write` o `organization:read` |
| `contacts.list()` / `contacts.retrieve()` | `GET /org-api/v1/contacts` | `contacts:read` o `organization:read` |
| `contacts.create()` / `update()` / `delete()` | `POST`, `PATCH`, `DELETE /org-api/v1/contacts` | `contacts:write` o `organization:read` |

`statuses.list()` sin categoría devuelve los estados de paquete, envío, otro y flota. `offices.list()` son las sucursales de atención y `warehouses.list()` las bodegas. El id de la sucursal es el `locationId` de un paquete; el de la bodega, el `warehouseId`.

`packages.list()` devuelve hasta 500 paquetes, los más recientes. Cada paquete trae `packageType` (`WR`), `receiptNumber` y `packageNumber`. En Misiil el recibo es el warehouse (`WHR…`) y el código de paquete es ese recibo más `P1`. `packages.listFromMisiil()` devuelve solo los paquetes ligados a Misiil y agrega `source: "misiil"`. La nota de bodega va en `warehouseComments` y la descripción en `comments`.

`packages.create` recibe `PackageCreate`: fecha, tracking, `itemStatusId` y `locationId`. Sin `receiptSerialNumber` el API abre un recibo WR y el paquete queda como P1. Para agregar P2 a un recibo ya creado, envía el `receiptSerialNumber` de ese recibo y `receiptPackageIndex`. `packages.delete` borra solo ese paquete.

Un recibo es el grupo de paquetes que comparten código. `receipts.create` recibe `ReceiptCreate` y la lista `packages` (P1, P2…). `externalReceiptCode` (`WHR…`) usa el warehouse del proveedor en lugar de la secuencia WR. El `id` del recibo es el id del primer paquete. Puedes pasar el id de cualquier pieza a `retrieve`, `update` y `delete`. `receipts.update` aplica la cabecera a todas las piezas; `packages` dentro del cuerpo cambia una pieza que ya existe. `receipts.delete` elimina el recibo completo. Las claves ya creadas con `organization:read` pueden usar este CRUD. Una clave solo con `packages:read` puede listar, no escribir.

`customers.create` recibe `CustomerCreate`. Cuenta `PERSONAL` pide `firstName` y cuenta `BUSINESS` pide `companyName`. No se envía `types`; el API lo guarda como `CLIENT`. `createContact: true` (o ausente) crea además un contacto `SHIPPER` con los mismos datos; `false` crea solo el cliente. `customers.update` recibe `CustomerWrite`. `contacts` es el contacto comercial y el cuerpo es `ContactWrite`. Su `types` sale de `CONTACT_TYPES` (`SHIPPER`, `CONSIGNEE`, `CARRIER`, `FORWARDER`, `NOTIFY_PARTY`, `BROKER`, `IMPORTER`, `EXPORTER`, `AGENT`, `WAREHOUSE`). Si no se envía, queda `SHIPPER`. `clientId` lo vincula al cliente. Las claves ya creadas con `organization:read` pueden usar este CRUD. La respuesta no incluye el id de autenticación ni la contraseña del portal.

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
