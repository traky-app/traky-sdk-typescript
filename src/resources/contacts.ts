import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type {
  Contact,
  ContactListParams,
  ContactWrite,
  DeletedResource,
  DirectoryPage,
} from "../types.js";

/**
 * Contactos comerciales de la organización, sin portal.
 * El rol se envía en `types` (`ContactType` / `CONTACT_TYPES`).
 */
export class ContactsResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los contactos.
   *
   * `query.types` filtra por rol (`SHIPPER`, `CONSIGNEE`, …).
   * `query.clientId` limita a los de un cliente.
   * Scope: `contacts:read` o `organization:read`.
   *
   * @param query - Página, búsqueda, `types`, `clientId`, `linked` o `unlinked`.
   * @param signal - Cancela la petición.
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

  /**
   * Devuelve un contacto por id.
   *
   * Scope: `contacts:read` o `organization:read`.
   *
   * @param id - Id del contacto.
   * @param signal - Cancela la petición.
   */
  retrieve(id: string, signal?: AbortSignal): Promise<Contact> {
    return this.http.get<Contact>(contactPath(id), undefined, signal);
  }

  /**
   * Crea un contacto.
   *
   * El cuerpo es `ContactWrite`.
   * Cuenta `PERSONAL` (por defecto): `firstName`. Cuenta `BUSINESS`: `companyName`.
   * `types` es un `ContactType[]`: `SHIPPER`, `CONSIGNEE`, `CARRIER`, `FORWARDER`,
   * `NOTIFY_PARTY`, `BROKER`, `IMPORTER`, `EXPORTER`, `AGENT`, `WAREHOUSE`.
   * Si omites `types`, queda `SHIPPER`. `CLIENT` no es válido.
   * `clientId` vincula el contacto a un cliente.
   * Scope: `contacts:write` o `organization:read`.
   *
   * @param body - Datos del contacto. Ver `ContactWrite`.
   * @param signal - Cancela la petición.
   */
  create(body: ContactWrite, signal?: AbortSignal): Promise<Contact> {
    return this.http.post<Contact>("/org-api/v1/contacts", body, signal);
  }

  /**
   * Actualiza un contacto. Solo hace falta enviar los campos que cambian.
   *
   * El cuerpo es `ContactWrite`. El id va en el primer argumento, no en el cuerpo.
   * `clientId: null` desvincula al cliente. `types` reemplaza los roles.
   * Scope: `contacts:write` o `organization:read`.
   *
   * @param id - Id del contacto.
   * @param body - Campos a cambiar. Ver `ContactWrite`.
   * @param signal - Cancela la petición.
   */
  update(
    id: string,
    body: ContactWrite,
    signal?: AbortSignal,
  ): Promise<Contact> {
    return this.http.patch<Contact>(contactPath(id), body, signal);
  }

  /**
   * Elimina un contacto.
   *
   * Scope: `contacts:write` o `organization:read`.
   *
   * @param id - Id del contacto.
   * @param signal - Cancela la petición.
   */
  delete(id: string, signal?: AbortSignal): Promise<DeletedResource> {
    return this.http.delete<DeletedResource>(contactPath(id), signal);
  }
}

function contactPath(id: string): string {
  return `/org-api/v1/contacts/${encodeURIComponent(id)}`;
}
