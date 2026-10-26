import type { TrakyHttp } from "../http.js";
import type { Organization } from "../types.js";

/** Organización dueña de la API key. */
export class OrganizationResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Devuelve la organización de la API key.
   *
   * Scope: `organization:read`.
   *
   * @param signal - Cancela la petición.
   */
  retrieve(signal?: AbortSignal): Promise<Organization> {
    return this.http.get<Organization>("/org-api/v1/organization", undefined, signal);
  }
}
