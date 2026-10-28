import type { TrakyHttp } from "../http.js";
import type { WarehouseList } from "../types.js";

/** Bodegas de la organización. Atajo de `offices.list({ type: "warehouse" })`. */
export class WarehousesResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista las bodegas. Misma ruta que `offices.list`, con `type=warehouse`.
   *
   * El `id` se usa como `warehouseId` al crear un paquete o un recibo.
   * Scope: `organization:read`, `packages:read` o `packages:write`.
   *
   * @param signal - Cancela la petición.
   */
  list(signal?: AbortSignal): Promise<WarehouseList> {
    return this.http.get<WarehouseList>(
      "/org-api/v1/offices",
      { type: "warehouse" },
      signal,
    );
  }
}
