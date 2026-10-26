import type { Query, QueryValue } from "./types.js";

type QueryInput = QueryValue | readonly string[];

function isStringList(value: QueryInput): value is readonly string[] {
  return Array.isArray(value);
}

/** Arma el query string. Los arrays salen unidos por coma (`types=CLIENT,SHIPPER`). */
export function toQuery(
  input?: Record<string, QueryInput>,
): Query | undefined {
  if (!input) return undefined;
  const query: Query = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    query[key] = isStringList(value) ? value.join(",") : value;
  }
  return query;
}
