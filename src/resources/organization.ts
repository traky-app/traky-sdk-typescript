import type { TrakyHttp } from "../http.js";
import type { Organization } from "../types.js";

export class OrganizationResource {
  constructor(private readonly http: TrakyHttp) {}

  /** Organización dueña de la API key. */
  retrieve(signal?: AbortSignal): Promise<Organization> {
    return this.http.get<Organization>("/org-api/v1/organization", undefined, signal);
  }
}
