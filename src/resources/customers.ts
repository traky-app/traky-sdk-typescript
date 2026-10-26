import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type {
  Customer,
  CustomerCreate,
  CustomerListParams,
  CustomerWrite,
  DeletedResource,
  DirectoryPage,
} from "../types.js";

/** Clientes con portal de la organización dueña de la API key. */
export class CustomersResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los clientes.
   *
   * `query.types` filtra por rol. El alta deja siempre `CLIENT`.
   * Scope: `customers:read` o `organization:read`.
   *
   * @param query - Página, búsqueda, `tagId` y `types`.
   * @param signal - Cancela la petición.
   */
  list(
    query?: CustomerListParams,
    signal?: AbortSignal,
  ): Promise<DirectoryPage<Customer>> {
    return this.http.get<DirectoryPage<Customer>>(
      "/org-api/v1/customers",
      toQuery(query),
      signal,
    );
  }

  /**
   * Devuelve un cliente por id.
   *
   * Scope: `customers:read` o `organization:read`.
   *
   * @param id - Id del cliente.
   * @param signal - Cancela la petición.
   */
  retrieve(id: string, signal?: AbortSignal): Promise<Customer> {
    return this.http.get<Customer>(customerPath(id), undefined, signal);
  }

  /**
   * Crea un cliente.
   *
   * El cuerpo es `CustomerCreate`. No envíes `types`: el API guarda `CLIENT`.
   * Cuenta `PERSONAL` (por defecto): `firstName`. Cuenta `BUSINESS`: `companyName`.
   * `createContact: true` (o ausente) crea un contacto `SHIPPER` con los mismos datos.
   * `createContact: false` crea solo el cliente.
   * Scope: `customers:write` o `organization:read`.
   *
   * @param body - Datos del cliente. Ver `CustomerCreate`.
   * @param signal - Cancela la petición.
   */
  create(body: CustomerCreate, signal?: AbortSignal): Promise<Customer> {
    return this.http.post<Customer>("/org-api/v1/customers", body, signal);
  }

  /**
   * Actualiza un cliente. Solo hace falta enviar los campos que cambian.
   *
   * El cuerpo es `CustomerWrite`. El id va en el primer argumento, no en el cuerpo.
   * Scope: `customers:write` o `organization:read`.
   *
   * @param id - Id del cliente.
   * @param body - Campos a cambiar. Ver `CustomerWrite`.
   * @param signal - Cancela la petición.
   */
  update(
    id: string,
    body: CustomerWrite,
    signal?: AbortSignal,
  ): Promise<Customer> {
    return this.http.patch<Customer>(customerPath(id), body, signal);
  }

  /**
   * Elimina un cliente.
   *
   * Scope: `customers:write` o `organization:read`.
   *
   * @param id - Id del cliente.
   * @param signal - Cancela la petición.
   */
  delete(id: string, signal?: AbortSignal): Promise<DeletedResource> {
    return this.http.delete<DeletedResource>(customerPath(id), signal);
  }
}

function customerPath(id: string): string {
  return `/org-api/v1/customers/${encodeURIComponent(id)}`;
}
