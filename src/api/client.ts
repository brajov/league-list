import type { z } from 'zod';

// How long a request may take before it is given up on. Without a limit a
// stalled connection would leave the loading state on screen for good.
export const REQUEST_TIMEOUT_MS = 10_000;

// Why a request failed, so the UI can say something more useful than "error".
// - 'network': no response at all. Offline, or the free key's rate limit: its
//   HTTP 429 carries no CORS header, so the browser reports a network failure.
// - 'timeout': no response within REQUEST_TIMEOUT_MS.
// - 'http': a response with a non-2xx status.
// - 'invalid': a response whose body is not JSON or does not match the schema.
export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'invalid';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options?.status;
  }
}

// Fetches a URL and validates the JSON body against a Zod schema.
// Every failure is thrown as an ApiError.
export async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'TimeoutError') {
      throw new ApiError('timeout', 'Request timed out', { cause });
    }
    throw new ApiError('network', 'Request failed without a response', { cause });
  }

  if (!response.ok) {
    throw new ApiError('http', `Request failed with status ${response.status}`, {
      status: response.status,
    });
  }

  try {
    const json: unknown = await response.json();
    return schema.parse(json);
  } catch (cause) {
    throw new ApiError('invalid', 'Response was not in the expected format', { cause });
  }
}
