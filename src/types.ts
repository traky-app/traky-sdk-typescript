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

/**
 * Paquete exportado por la Org API.
 * La API devuelve el registro completo (sin metadatos internos de IA).
 * Este tipo cubre los campos estables; el resto llega en la respuesta JSON.
 */
export type Package = {
  id: string;
  packageType: string;
  serialNumber: number | null;
  receiptPackageIndex: number;
  trackingNumber: string | null;
  weight: number;
  declaredValue: number;
  height: number;
  width: number;
  length: number;
  pieces: number;
  volumetricWeight: number;
  chargeableWeight: number;
  comments: string;
  warehouseComments: string | null;
  isConsolidated: boolean;
  isGrouped: boolean;
  guideId: string | null;
  saleId: string | null;
  rackCode: string | null;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
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
