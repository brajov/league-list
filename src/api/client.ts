import type { z } from 'zod';

// Fetches a URL and validates the JSON body against a Zod schema.
// Throws on a non-2xx status or when the body does not match the schema.
export async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const json: unknown = await response.json();
  return schema.parse(json);
}
