import { TrakyApiError, TrakyError } from "./errors.js";
import type { Query, TrakyClientOptions } from "./types.js";
import { SDK_NAME, SDK_VERSION } from "./version.js";

export const DEFAULT_BASE_URL = "https://api.traky.app";

const DEFAULT_TIMEOUT_MS = 30_000;

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method: HttpMethod;
  path: string;
  query?: Query | undefined;
  body?: unknown;
  signal?: AbortSignal | undefined;
};

export class TrakyHttp {
  readonly baseUrl: string;
  readonly apiKey: string;

  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly extraHeaders: Record<string, string>;

  constructor(options: TrakyClientOptions) {
    const apiKey = options.apiKey.trim();
    if (!apiKey) {
      throw new TrakyError(
        "Falta la API key. Créala en Traky y pásala en `apiKey` (prefijo trk_).",
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.extraHeaders = options.headers ?? {};
  }

  get<T>(path: string, query?: Query, signal?: AbortSignal): Promise<T> {
    return this.request<T>({ method: "GET", path, query, signal });
  }

  post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>({ method: "POST", path, body, signal });
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = new URL(`${this.baseUrl}${normalizePath(options.path)}`);
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const onParentAbort = () => controller.abort();
    options.signal?.addEventListener("abort", onParentAbort, { once: true });
    if (options.signal?.aborted) controller.abort();

    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "User-Agent": `${SDK_NAME}/${SDK_VERSION}`,
        ...this.extraHeaders,
      };
      if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
      }

      const response = await this.fetchImpl(url, {
        method: options.method,
        headers,
        signal: controller.signal,
        ...(options.body !== undefined
          ? { body: JSON.stringify(options.body) }
          : {}),
      });

      const payload = await readBody(response);
      if (!response.ok) {
        throw TrakyApiError.fromResponse(response.status, payload);
      }
      return payload as T;
    } catch (error) {
      if (error instanceof TrakyError) throw error;
      if (isAbortError(error)) {
        throw new TrakyError(
          `La petición a Traky superó ${this.timeoutMs} ms.`,
          { cause: error },
        );
      }
      throw new TrakyError("No se pudo contactar la API de Traky.", {
        cause: error,
      });
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onParentAbort);
    }
  }
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
