import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type {
  DeletedResource,
  Status,
  StatusCreate,
  StatusList,
  StatusListParams,
  StatusWrite,
} from "../types.js";

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

  /**
   * Devuelve un estado por id.
   *
   * Scope: `organization:read`, `packages:read` o `packages:write`.
   *
   * @param id - Id del estado.
   * @param signal - Cancela la petición.
   */
  retrieve(id: string, signal?: AbortSignal): Promise<Status> {
    return this.http.get<Status>(statusPath(id), undefined, signal);
  }

  /**
   * Crea un estado.
   *
   * El cuerpo es `StatusCreate`. `category` es `package`, `other` o `fleet`.
   * `shipment` ya no se puede crear. Sin `position` el API deja 1.
   * Scope: `packages:write` o `organization:read`.
   *
   * @param body - Datos del estado. Ver `StatusCreate`.
   * @param signal - Cancela la petición.
   */
  create(body: StatusCreate, signal?: AbortSignal): Promise<Status> {
    return this.http.post<Status>("/org-api/v1/statuses", body, signal);
  }

  /**
   * Actualiza un estado. Solo hace falta enviar los campos que cambian.
   *
   * El cuerpo es `StatusWrite`. `warehouseId` o `locationId` en `null` quita el vínculo.
   * Scope: `packages:write` o `organization:read`.
   *
   * @param id - Id del estado.
   * @param body - Campos a cambiar. Ver `StatusWrite`.
   * @param signal - Cancela la petición.
   */
  update(id: string, body: StatusWrite, signal?: AbortSignal): Promise<Status> {
    return this.http.patch<Status>(statusPath(id), body, signal);
  }

  /**
   * Elimina un estado.
   *
   * Scope: `packages:write` o `organization:read`.
   *
   * @param id - Id del estado.
   * @param signal - Cancela la petición.
   */
  delete(id: string, signal?: AbortSignal): Promise<DeletedResource> {
    return this.http.delete<DeletedResource>(statusPath(id), signal);
  }
}

function statusPath(id: string): string {
  return `/org-api/v1/statuses/${encodeURIComponent(id)}`;
}
