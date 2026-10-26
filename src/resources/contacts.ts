import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type {
  Contact,
  ContactListParams,
  ContactWrite,
  DeletedResource,
  DirectoryPage,
} from "../types.js";

export class ContactsResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los contactos comerciales de la organización.
   * Requiere `contacts:read` o `organization:read`.
   */
  list(
    query?: ContactListParams,
    signal?: AbortSignal,
  ): Promise<DirectoryPage<Contact>> {
    return this.http.get<DirectoryPage<Contact>>(
      "/org-api/v1/contacts",
      toQuery(query),
      signal,
    );
  }

  /** Contacto por id. Requiere `contacts:read` o `organization:read`. */
  retrieve(id: string, signal?: AbortSignal): Promise<Contact> {
    return this.http.get<Contact>(contactPath(id), undefined, signal);
  }

  /**
   * Crea un contacto. Cuenta personal: `firstName`. Empresa: `companyName`.
   * Requiere `contacts:write` o `organization:read`.
   */
  create(body: ContactWrite, signal?: AbortSignal): Promise<Contact> {
    return this.http.post<Contact>("/org-api/v1/contacts", body, signal);
  }

  /**
   * Actualiza un contacto. `clientId: null` lo desvincula del cliente.
   * Requiere `contacts:write` o `organization:read`.
   */
  update(id: string, body: ContactWrite, signal?: AbortSignal): Promise<Contact> {
    return this.http.patch<Contact>(contactPath(id), body, signal);
  }

  /** Elimina un contacto. Requiere `contacts:write` o `organization:read`. */
  delete(id: string, signal?: AbortSignal): Promise<DeletedResource> {
    return this.http.delete<DeletedResource>(contactPath(id), signal);
  }
}

function contactPath(id: string): string {
  return `/org-api/v1/contacts/${encodeURIComponent(id)}`;
}
