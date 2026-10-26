/** Organización autenticada por la API key. `GET /org-api/v1/organization`. */
export type Organization = {
  id: string;
  name: string;
  slug: string;
  enterpriseCode: string | null;
  countryCode: string;
  currency: string;
  organizationId: string | null;
};

/** Prefijo interno del recibo. Hoy el único tipo es WR. */
export type PackageType = "WR";

export type PackageParty = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
};

export type PackageStatus = {
  id: string;
  name: string;
};

export type PackageOffice = {
  id: string;
  name: string;
};

/**
 * Paquete exportado por la Org API.
 * Incluye el código de recibo y el código de paquete (WR del sistema o WHR de Misiil).
 * No trae la nota de administración ni los metadatos internos de IA.
 */
export type Package = {
  id: string;
  packageType: PackageType;
  serialNumber: number | null;
  receiptPackageIndex: number;
  /** Código de recibo: secuencia WR o warehouse externo (WHR…). */
  receiptNumber: string | null;
  /** Código de paquete: recibo + P1, P2… */
  packageNumber: string | null;
  trackingNumber: string | null;
  trackingNormalized: string | null;
  weight: number;
  weightUnit: string | null;
  volumetricWeight: number;
  chargeableWeight: number;
  declaredValue: number;
  height: number;
  width: number;
  length: number;
  dimensionUnit: string | null;
  pieces: number;
  /** Descripción de la mercancía. */
  comments: string | null;
  /** Nota de bodega. En Misiil es la columna Nota. */
  warehouseComments: string | null;
  isConsolidated: boolean;
  isGrouped: boolean;
  guideId: string | null;
  saleId: string | null;
  rackCode: string | null;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  itemStatus: PackageStatus | null;
  customer: PackageParty | null;
  shipper: PackageParty | null;
  location: PackageOffice | null;
  warehouse: PackageOffice | null;
};

export type PackageExport = {
  data: Package[];
  total: number;
  exportedAt: string;
};

export type MisiilPackageExport = PackageExport & {
  source: "misiil";
};

/** Tipo de cuenta. Personal exige `firstName`. Empresa exige `companyName`. */
export const ACCOUNT_TYPES = ["PERSONAL", "BUSINESS"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

/**
 * Roles de directorio. En un cliente el API solo persiste `CLIENT`.
 * El resto se envía en `types` del contacto.
 */
export const CUSTOMER_TYPES = [
  "CLIENT",
  "SHIPPER",
  "CONSIGNEE",
  "CARRIER",
  "FORWARDER",
  "NOTIFY_PARTY",
  "BROKER",
  "IMPORTER",
  "EXPORTER",
  "AGENT",
  "WAREHOUSE",
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

/**
 * Roles que se envían en `types` de un contacto.
 * Los mismos que el cliente, sin `CLIENT`: un contacto no tiene portal.
 */
export const CONTACT_TYPES = [
  "SHIPPER",
  "CONSIGNEE",
  "CARRIER",
  "FORWARDER",
  "NOTIFY_PARTY",
  "BROKER",
  "IMPORTER",
  "EXPORTER",
  "AGENT",
  "WAREHOUSE",
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];

export type DirectoryEmail = {
  label?: string;
  value: string;
};

export type DirectoryPhone = {
  label?: string;
  value: string;
  channel?: "whatsapp" | "phone";
};

export type DirectoryTag = {
  id: string;
  name: string;
  color: string | null;
};

export type DirectoryPage<T> = {
  data: T[];
  pagination: {
    total?: number;
    page?: number;
    limit: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    nextCursor?: string | null;
  };
};

export type DeletedResource = {
  id: string;
  deleted: true;
};

/**
 * Cliente de la organización.
 * `GET/POST /org-api/v1/customers` y `GET/PATCH/DELETE /org-api/v1/customers/:id`.
 */
export type Customer = {
  id: string;
  accountType: AccountType | null;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username: string | null;
  nationality: string | null;
  identityType: string | null;
  identityNumber: string | null;
  whatsapp: string | null;
  emails: DirectoryEmail[];
  phones: DirectoryPhone[];
  city: string | null;
  stateOrProvince: string | null;
  address: string | null;
  postalCode: string | null;
  note: string | null;
  mailbox: string | null;
  enterpriseCode: string | null;
  isActive: boolean;
  /** Siempre `CLIENT`. Los roles operativos se envían en el contacto. */
  types: ["CLIENT"];
  tags: DirectoryTag[];
  createdAt: string | null;
  updatedAt: string | null;
};

/**
 * Cuerpo de `customers.create` y `customers.update`.
 * No incluye `types`: el API guarda siempre `CLIENT`.
 * El rol operativo (`SHIPPER`, `CONSIGNEE`, …) se envía en `contacts`.
 */
export type CustomerWrite = {
  accountType?: AccountType;
  companyName?: string;
  nationality?: string;
  identityType?: string;
  identityNumber?: string;
  email?: string;
  username?: string;
  whatsapp?: string;
  lastName?: string;
  firstName?: string;
  city?: string;
  stateOrProvince?: string;
  address?: string;
  postalCode?: string;
  note?: string;
  mailbox?: string;
  isActive?: boolean;
  emails?: DirectoryEmail[];
  phones?: DirectoryPhone[];
  tagIds?: string[];
};

/**
 * Cuerpo de `customers.create`.
 * `createContact` decide si el API también crea el contacto SHIPPER.
 */
export type CustomerCreate = CustomerWrite & {
  /**
   * `true` o ausente: crea un contacto `SHIPPER` con los mismos datos del cliente.
   * `false`: crea solo el cliente.
   */
  createContact?: boolean;
};

export type CustomerListParams = {
  search?: string;
  isActive?: boolean;
  sortBy?: "recent" | "oldest" | "name-asc" | "name-desc";
  tagId?: string;
  types?: CustomerType[];
  page?: number;
  limit?: number;
  cursor?: string;
};

/**
 * Contacto comercial, sin portal.
 * `GET/POST /org-api/v1/contacts` y `GET/PATCH/DELETE /org-api/v1/contacts/:id`.
 */
export type Contact = {
  id: string;
  accountType: AccountType | null;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  nationality: string | null;
  identityType: string | null;
  identityNumber: string | null;
  whatsapp: string | null;
  emails: DirectoryEmail[];
  phones: DirectoryPhone[];
  city: string | null;
  stateOrProvince: string | null;
  address: string | null;
  postalCode: string | null;
  note: string | null;
  isActive: boolean;
  /** Roles del contacto. Valores de `CONTACT_TYPES`. Nunca `CLIENT`. */
  types: ContactType[];
  clientId: string | null;
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    email: string | null;
  } | null;
  tags: DirectoryTag[];
  createdAt: string | null;
  updatedAt: string | null;
};

/** Cuerpo de `contacts.create` y `contacts.update`. */
export type ContactWrite = {
  accountType?: AccountType;
  companyName?: string;
  nationality?: string;
  identityType?: string;
  identityNumber?: string;
  email?: string;
  whatsapp?: string;
  lastName?: string;
  firstName?: string;
  city?: string;
  stateOrProvince?: string;
  address?: string;
  postalCode?: string;
  note?: string;
  isActive?: boolean;
  emails?: DirectoryEmail[];
  phones?: DirectoryPhone[];
  /**
   * Roles a guardar. Si no se envía, el API deja `SHIPPER`.
   * Valores: `SHIPPER`, `CONSIGNEE`, `CARRIER`, `FORWARDER`, `NOTIFY_PARTY`,
   * `BROKER`, `IMPORTER`, `EXPORTER`, `AGENT`, `WAREHOUSE`.
   */
  types?: ContactType[];
  /** Cliente al que vincular. `null` en un update lo desvincula. */
  clientId?: string | null;
  tagIds?: string[];
};

export type ContactListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  types?: ContactType[];
  clientId?: string;
  unlinked?: boolean;
  linked?: boolean;
  sortBy?: "recent" | "oldest" | "name-asc" | "name-desc";
};

export type QueryValue = string | number | boolean | null | undefined;

export type Query = Record<string, QueryValue>;

export type TrakyClientOptions = {
  /** Secreto de la API key de organización. Prefijo `trk_`. */
  apiKey: string;
  /** Por defecto `https://api.traky.app`. */
  baseUrl?: string;
  /** Sustituye `fetch` global. Útil en tests. */
  fetch?: typeof fetch;
  /** Tiempo máximo de cada petición. Por defecto 30s. */
  timeoutMs?: number;
  /** Headers extra. No pisan `Authorization`. */
  headers?: Record<string, string>;
};
