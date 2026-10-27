import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type {
  DeletedReceipt,
  Receipt,
  ReceiptCreate,
  ReceiptListParams,
  ReceiptPage,
  ReceiptUpdate,
} from "../types.js";

/**
 * Recibos de la organización.
 * Un recibo agrupa paquetes P1, P2… con el mismo código (`WR…` o `WHR…`).
 * `id` es el id del primer paquete.
 */
export class ReceiptsResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los recibos de la organización.
   *
   * Cada fila es un recibo, no un paquete. No incluye `packages`.
   * Scope: `packages:read`.
   *
   * @param query - Página, tracking, oficina, cliente, remitente o estado.
   * @param signal - Cancela la petición.
   */
  list(query?: ReceiptListParams, signal?: AbortSignal): Promise<ReceiptPage> {
    return this.http.get<ReceiptPage>(
      "/org-api/v1/receipts",
      toQuery(query),
      signal,
    );
  }

  /**
   * Devuelve un recibo y sus paquetes.
   *
   * Puedes pasar el id de cualquier pieza del recibo. La respuesta usa el id de P1.
   * Scope: `packages:read`.
   *
   * @param id - Id de un paquete del recibo.
   * @param signal - Cancela la petición.
   */
  retrieve(id: string, signal?: AbortSignal): Promise<Receipt> {
    return this.http.get<Receipt>(receiptPath(id), undefined, signal);
  }

  /**
   * Crea un recibo con una o más piezas.
   *
   * El cuerpo es `ReceiptCreate`. La primera pieza reserva el WR, salvo que
   * envíes `externalReceiptCode` (`WHR…`).
   * Scope: `packages:write` o `organization:read`.
   *
   * @param body - Cabecera del recibo y la lista `packages`. Ver `ReceiptCreate`.
   * @param signal - Cancela la petición.
   */
  create(body: ReceiptCreate, signal?: AbortSignal): Promise<Receipt> {
    return this.http.post<Receipt>("/org-api/v1/receipts", body, signal);
  }

  /**
   * Actualiza un recibo.
   *
   * Los campos de la cabecera se aplican a todas las piezas.
   * `packages` cambia una pieza que ya existe, por su id. No agrega ni quita piezas:
   * para eso usa `packages.create` (con `receiptSerialNumber`) o `packages.delete`.
   * Scope: `packages:write` o `organization:read`.
   *
   * @param id - Id de un paquete del recibo.
   * @param body - Campos a cambiar. Ver `ReceiptUpdate`.
   * @param signal - Cancela la petición.
   */
  update(id: string, body: ReceiptUpdate, signal?: AbortSignal): Promise<Receipt> {
    return this.http.patch<Receipt>(receiptPath(id), body, signal);
  }

  /**
   * Elimina el recibo completo: todas sus piezas.
   *
   * Scope: `packages:write` o `organization:read`.
   *
   * @param id - Id de un paquete del recibo.
   * @param signal - Cancela la petición.
   */
  delete(id: string, signal?: AbortSignal): Promise<DeletedReceipt> {
    return this.http.delete<DeletedReceipt>(receiptPath(id), signal);
  }
}

function receiptPath(id: string): string {
  return `/org-api/v1/receipts/${encodeURIComponent(id)}`;
}
