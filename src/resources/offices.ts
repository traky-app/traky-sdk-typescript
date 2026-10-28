import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type { OfficeList, OfficeListParams } from "../types.js";

/** Offices de la organización: sucursal de atención o bodega, según `type`. */
export class OfficesResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los offices.
   *
   * Sin `query.type` devuelve sucursales (`office`) y bodegas (`warehouse`).
   * El `id` de un `office` se usa como `locationId`. El de un `warehouse`, como `warehouseId`.
   * Scope: `organization:read`, `packages:read` o `packages:write`.
   *
   * @param query - `type`: `office` o `warehouse`.
   * @param signal - Cancela la petición.
   */
  list(query?: OfficeListParams, signal?: AbortSignal): Promise<OfficeList> {
    return this.http.get<OfficeList>(
      "/org-api/v1/offices",
      toQuery(query),
      signal,
    );
  }
}
