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
