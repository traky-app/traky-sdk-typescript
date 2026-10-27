import type { TrakyHttp } from "../http.js";
import type { OfficeList } from "../types.js";

/** Sucursales de atención de la organización. */
export class OfficesResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista las sucursales. No incluye las bodegas.
   *
   * El `id` se usa como `locationId` al crear un paquete o un recibo.
   * Scope: `organization:read`, `packages:read` o `packages:write`.
   *
   * @param signal - Cancela la petición.
   */
  list(signal?: AbortSignal): Promise<OfficeList> {
    return this.http.get<OfficeList>("/org-api/v1/offices", undefined, signal);
  }
}
