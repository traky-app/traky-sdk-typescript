# @traky/sdk

SDK de Node.js para la [API de organización de Traky](https://api.traky.app). Autentica con una API key (`trk_…`) y llama a `/org-api/v1`.

Requiere Node.js 20 o superior. No tiene dependencias de runtime: usa `fetch`.

## Instalación

```bash
npm install @traky/sdk
```

## Uso

Crea la API key en Traky (ajustes de desarrollador de la empresa) y guárdala en `TRAKY_API_KEY`.

```ts
import { Traky } from "@traky/sdk";

const traky = new Traky({
  apiKey: process.env.TRAKY_API_KEY!,
});

const organization = await traky.organization.retrieve();
const packages = await traky.packages.list();
const misiil = await traky.packages.listFromMisiil();
```

| Método | Endpoint | Scope |
| --- | --- | --- |
| `organization.retrieve()` | `GET /org-api/v1/organization` | `organization:read` |
| `packages.list()` | `GET /org-api/v1/packages` | `packages:read` |
| `packages.listFromMisiil()` | `GET /org-api/v1/bots/misiil/packages` | `packages:read` |

`packages.list()` devuelve hasta 500 paquetes, los más recientes. La API también acepta la key en el header `X-Api-Key`; este SDK envía `Authorization: Bearer`.

### Entorno local

```ts
const traky = new Traky({
  apiKey: process.env.TRAKY_API_KEY!,
  baseUrl: "http://localhost:4000",
});
```

### Errores

```ts
import { Traky, TrakyApiError } from "@traky/sdk";

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

El paquete es público bajo el scope `@traky`. La primera vez hay que crear la organización en npm y iniciar sesión.

```bash
npm login
pnpm publish
```

`prepublishOnly` corre typecheck, tests y build antes de subir el tarball.
