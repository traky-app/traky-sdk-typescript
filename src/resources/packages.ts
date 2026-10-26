import type { TrakyHttp } from "../http.js";
import type { MisiilPackageExport, PackageExport } from "../types.js";

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
}
