import { TrakyHttp } from "./http.js";
import { OrganizationResource } from "./resources/organization.js";
import { PackagesResource } from "./resources/packages.js";
import type { TrakyClientOptions } from "./types.js";

/**
 * Cliente de la API de organización (`/org-api/v1`).
 *
 * ```ts
 * const traky = new Traky({ apiKey: process.env.TRAKY_API_KEY! });
 * const org = await traky.organization.retrieve();
 * ```
 */
export class Traky {
  readonly organization: OrganizationResource;
  readonly packages: PackagesResource;

  private readonly http: TrakyHttp;

  constructor(options: TrakyClientOptions) {
    this.http = new TrakyHttp(options);
    this.organization = new OrganizationResource(this.http);
    this.packages = new PackagesResource(this.http);
  }
}
