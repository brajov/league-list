import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, fetchJson } from './client';

const schema = z.object({ name: z.string() });
const URL = 'https://example.com/data';

function stubFetch(reply: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(reply));
}

// Resolves with the ApiError a failed fetchJson call throws.
async function failure(): Promise<ApiError> {
  const error = await fetchJson(URL, schema).catch((thrown: unknown) => thrown);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

describe('fetchJson', () => {
  it('returns the validated body', async () => {
    stubFetch(async () => Response.json({ name: 'NBA', extra: true }));
    expect(await fetchJson(URL, schema)).toEqual({ name: 'NBA' });
  });

  it('reports a request that got no response as a network error', async () => {
    stubFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect((await failure()).kind).toBe('network');
  });

  it('reports a request that ran out of time as a timeout', async () => {
    stubFetch(async () => {
      throw new DOMException('The operation timed out', 'TimeoutError');
    });
    expect((await failure()).kind).toBe('timeout');
  });

  it('reports a non-2xx status as an http error with the status', async () => {
    stubFetch(async () => new Response('Too many requests', { status: 429 }));
    const error = await failure();
    expect(error.kind).toBe('http');
    expect(error.status).toBe(429);
  });

  it('reports a body that is not JSON as invalid', async () => {
    stubFetch(async () => new Response('<html>'));
    expect((await failure()).kind).toBe('invalid');
  });

  it('reports a body that does not match the schema as invalid', async () => {
    stubFetch(async () => Response.json({ name: 42 }));
    expect((await failure()).kind).toBe('invalid');
  });

  it('gives every request a time limit', async () => {
    stubFetch(async () => Response.json({ name: 'NBA' }));
    await fetchJson(URL, schema);
    expect(vi.mocked(fetch).mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
});
