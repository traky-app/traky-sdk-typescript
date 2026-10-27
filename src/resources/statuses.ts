import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type { StatusList, StatusListParams } from "../types.js";

/** Estados de la organización: paquete, envío, otro y flota. */
export class StatusesResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los estados.
   *
   * Sin `query.category` devuelve todos: `package`, `shipment`, `other` y `fleet`.
   * Scope: `organization:read`, `packages:read` o `packages:write`.
   *
   * @param query - Categoría opcional.
   * @param signal - Cancela la petición.
   */
  list(query?: StatusListParams, signal?: AbortSignal): Promise<StatusList> {
    return this.http.get<StatusList>(
      "/org-api/v1/statuses",
      toQuery(query),
      signal,
    );
  }
}
