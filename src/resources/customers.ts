import type { TrakyHttp } from "../http.js";
import { toQuery } from "../query.js";
import type {
  Customer,
  CustomerListParams,
  CustomerWrite,
  DeletedResource,
  DirectoryPage,
} from "../types.js";

export class CustomersResource {
  constructor(private readonly http: TrakyHttp) {}

  /**
   * Lista los clientes de la organización.
   * Requiere `customers:read` o `organization:read`.
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

  /** Cliente por id. Requiere `customers:read` o `organization:read`. */
  retrieve(id: string, signal?: AbortSignal): Promise<Customer> {
    return this.http.get<Customer>(customerPath(id), undefined, signal);
  }

  /**
   * Crea un cliente. Cuenta personal: `firstName`. Empresa: `companyName`.
   * Requiere `customers:write` o `organization:read`.
   */
  create(body: CustomerWrite, signal?: AbortSignal): Promise<Customer> {
    return this.http.post<Customer>("/org-api/v1/customers", body, signal);
  }

  /** Actualiza un cliente. Requiere `customers:write` o `organization:read`. */
  update(
    id: string,
    body: CustomerWrite,
    signal?: AbortSignal,
  ): Promise<Customer> {
    return this.http.patch<Customer>(customerPath(id), body, signal);
  }

  /** Elimina un cliente. Requiere `customers:write` o `organization:read`. */
  delete(id: string, signal?: AbortSignal): Promise<DeletedResource> {
    return this.http.delete<DeletedResource>(customerPath(id), signal);
  }
}

function customerPath(id: string): string {
  return `/org-api/v1/customers/${encodeURIComponent(id)}`;
}
