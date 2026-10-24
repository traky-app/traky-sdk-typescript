/** Error base del SDK. Los fallos de red y de configuración también lo usan. */
export class TrakyError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(
      message,
      options?.cause !== undefined ? { cause: options.cause } : undefined,
    );
    this.name = "TrakyError";
  }
}

/**
 * La API respondió con un status HTTP de error.
 * El cuerpo suele ser el JSON de Nest: `{ statusCode, message, error }`.
 */
export class TrakyApiError extends TrakyError {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "TrakyApiError";
    this.status = status;
    this.body = body;
  }

  static fromResponse(status: number, body: unknown): TrakyApiError {
    return new TrakyApiError(messageFromBody(body, status), status, body);
  }
}

function messageFromBody(body: unknown, status: number): string {
  if (!body || typeof body !== "object") {
    return `Traky respondió ${status}.`;
  }

  const record = body as { message?: unknown; error?: unknown };
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (Array.isArray(record.message)) {
    const parts = record.message.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (parts.length > 0) return parts.join("; ");
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim();
  }
  return `Traky respondió ${status}.`;
}
