import type { TrakyHttp } from "../http.js";
import type {
  DeletedResource,
  MisiilPackageExport,
  Package,
  PackageCreate,
  PackageExport,
  PackageWrite,
} from "../types.js";

/** Paquetes exportados de la organización. */
export class PackagesResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los paquetes de la organización, hasta 500, los más recientes.
   *
   * Cada paquete trae `packageType` (`WR`), `receiptNumber` y `packageNumber`.
   * Scope: `packages:read`.
   *
   * @param signal - Cancela la petición.
   */
  list(signal?: AbortSignal): Promise<PackageExport> {
    return this.http.get<PackageExport>("/org-api/v1/packages", undefined, signal);
  }

  /**
   * Lista solo los paquetes ligados a Misiil.
   *
   * La respuesta agrega `source: "misiil"`. El recibo es el warehouse (`WHR…`).
   * Scope: `packages:read`.
   *
   * @param signal - Cancela la petición.
   */
  listFromMisiil(signal?: AbortSignal): Promise<MisiilPackageExport> {
    return this.http.get<MisiilPackageExport>(
      "/org-api/v1/marketplaces/misiil/packages",
      undefined,
      signal,
    );
  }

  /**
   * Devuelve un paquete por id.
   *
   * La forma es la misma que una fila de `list()`.
   * Scope: `packages:read`.
   *
   * @param id - Id del paquete.
   * @param signal - Cancela la petición.
   */
  retrieve(id: string, signal?: AbortSignal): Promise<Package> {
    return this.http.get<Package>(packagePath(id), undefined, signal);
  }

  /**
   * Crea un paquete.
   *
   * El cuerpo es `PackageCreate`. Hacen falta fecha, tracking, estado y oficina.
   * Sin `receiptSerialNumber` el API reserva un recibo WR nuevo y este paquete es P1.
   * Para colgar P2 en un recibo ya creado, envía su `receiptSerialNumber` y el índice.
   * Scope: `packages:write` o `organization:read`.
   *
   * @param body - Datos del paquete. Ver `PackageCreate`.
   * @param signal - Cancela la petición.
   */
  create(body: PackageCreate, signal?: AbortSignal): Promise<Package> {
    return this.http.post<Package>("/org-api/v1/packages", body, signal);
  }

  /**
   * Actualiza un paquete. Solo hace falta enviar los campos que cambian.
   *
   * El cuerpo es `PackageWrite`. El id va en el primer argumento, no en el cuerpo.
   * Scope: `packages:write` o `organization:read`.
   *
   * @param id - Id del paquete.
   * @param body - Campos a cambiar. Ver `PackageWrite`.
   * @param signal - Cancela la petición.
   */
  update(id: string, body: PackageWrite, signal?: AbortSignal): Promise<Package> {
    return this.http.patch<Package>(packagePath(id), body, signal);
  }

  /**
   * Elimina un paquete. No borra el resto del recibo.
   *
   * Scope: `packages:write` o `organization:read`.
   *
   * @param id - Id del paquete.
   * @param signal - Cancela la petición.
   */
  delete(id: string, signal?: AbortSignal): Promise<DeletedResource> {
    return this.http.delete<DeletedResource>(packagePath(id), signal);
  }
}

function packagePath(id: string): string {
  return `/org-api/v1/packages/${encodeURIComponent(id)}`;
}
