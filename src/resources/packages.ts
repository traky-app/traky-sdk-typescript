import type { TrakyHttp } from "../http.js";
import type { MisiilPackageExport, PackageExport } from "../types.js";

export class PackagesResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Exporta los paquetes de la organización (hasta 500, los más recientes).
   * Requiere scope `packages:read`.
   */
  list(signal?: AbortSignal): Promise<PackageExport> {
    return this.http.get<PackageExport>("/org-api/v1/packages", undefined, signal);
  }

  /**
   * Paquetes del marketplace Misiil.
   * Requiere scope `packages:read`.
   */
  listFromMisiil(signal?: AbortSignal): Promise<MisiilPackageExport> {
    return this.http.get<MisiilPackageExport>(
      "/org-api/v1/marketplaces/misiil/packages",
      undefined,
      signal,
    );
  }
}
