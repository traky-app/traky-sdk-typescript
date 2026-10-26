import { TrakyHttp } from "./http.js";
import { ContactsResource } from "./resources/contacts.js";
import { CustomersResource } from "./resources/customers.js";
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
  /** Organización dueña de la API key. */
  readonly organization: OrganizationResource;
  /** Exportación de paquetes y de paquetes de Misiil. */
  readonly packages: PackagesResource;
  /** Clientes con portal. El alta usa `CustomerCreate` (`createContact`). */
  readonly customers: CustomersResource;
  /** Contactos comerciales. El rol se envía en `ContactWrite.types`. */
  readonly contacts: ContactsResource;

  readonly #http: TrakyHttp;

  /**
   * @param options - `apiKey` con prefijo `trk_`. `baseUrl` solo si no es producción.
   */
  constructor(options: TrakyClientOptions) {
    this.#http = new TrakyHttp(options);
    this.organization = new OrganizationResource(this.#http);
    this.packages = new PackagesResource(this.#http);
    this.customers = new CustomersResource(this.#http);
    this.contacts = new ContactsResource(this.#http);
  }
}
