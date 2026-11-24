import { TrakyError } from "./errors.js";

export type IdentityKind = "CEDULA" | "RUC" | "PASSPORT" | "OTHER";

const CEDULA_NAMES =
  "Con cédula no envíes firstName, lastName ni companyName. La verificación completa el nombre y el apellido.";
const RUC_NAMES =
  "Con RUC no envíes firstName, lastName ni companyName. La verificación completa la razón social.";
const PASSPORT_NAMES =
  "Con pasaporte envía identityNumber, firstName y lastName. Ese documento no se consulta en el registro.";
const PASSPORT_COMPANY =
  "Con pasaporte no envíes companyName. El nombre va en firstName y lastName.";

export type CustomerIdentityInput = {
  identityType?: string | null;
  identityNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
};

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

/** `null` si no hay tipo. `OTHER` si el tipo no se consulta. */
export function identityKind(value: unknown): IdentityKind | null {
  const raw = text(value)
    ?.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9_]/g, "");
  if (!raw) return null;
  if (raw === "CEDULA" || raw === "EC_CEDULA") return "CEDULA";
  if (raw === "RUC" || raw === "EC_RUC") return "RUC";
  if (raw === "PASSPORT" || raw === "PASAPORTE") return "PASSPORT";
  return "OTHER";
}

function hasLegalName(input: CustomerIdentityInput): boolean {
  return Boolean(
    text(input.firstName) || text(input.lastName) || text(input.companyName),
  );
}

/**
 * Valida el cuerpo antes de enviarlo.
 * Cédula y RUC solo llevan el número. Pasaporte lleva número, nombre y apellido.
 * En un update sin `identityType` no se adivina el documento guardado: lo rechaza el API.
 */
export function assertCustomerIdentityWrite(
  input: CustomerIdentityInput,
  mode: "create" | "update",
): void {
  const kind =
    mode === "create" || input.identityType !== undefined
      ? identityKind(input.identityType)
      : null;
  if (kind == null || kind === "OTHER") return;

  if (kind === "PASSPORT") {
    if (text(input.companyName)) throw new TrakyError(PASSPORT_COMPANY);
    if (!text(input.firstName) || !text(input.lastName)) {
      throw new TrakyError(PASSPORT_NAMES);
    }
    const number = (text(input.identityNumber) ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if (number.length < 5 || number.length > 20) {
      throw new TrakyError(
        "El número de pasaporte debe tener entre 5 y 20 letras o números.",
      );
    }
    return;
  }

  if (hasLegalName(input)) {
    throw new TrakyError(kind === "CEDULA" ? CEDULA_NAMES : RUC_NAMES);
  }
  const digits = (text(input.identityNumber) ?? "").replace(/\D/g, "");
  if (!digits) {
    throw new TrakyError(
      kind === "CEDULA" ? "La cédula es obligatoria." : "El RUC es obligatorio.",
    );
  }
  if (kind === "CEDULA" && digits.length !== 10) {
    throw new TrakyError("La cédula debe tener 10 dígitos.");
  }
  if (kind === "RUC" && digits.length !== 13) {
    throw new TrakyError("El RUC debe tener 13 dígitos.");
  }
}
