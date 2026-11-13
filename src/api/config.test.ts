import { afterEach, describe, expect, it, vi } from 'vitest';
import { FREE_API_KEY, getApiBaseUrl, getApiKey } from './config';

describe('API key', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the free key when VITE_SPORTSDB_API_KEY is not set', () => {
    vi.stubEnv('VITE_SPORTSDB_API_KEY', undefined);
    expect(getApiKey()).toBe(FREE_API_KEY);
  });

  it('uses the free key when VITE_SPORTSDB_API_KEY is blank', () => {
    vi.stubEnv('VITE_SPORTSDB_API_KEY', '   ');
    expect(getApiKey()).toBe(FREE_API_KEY);
  });

  it('uses VITE_SPORTSDB_API_KEY when it is set', () => {
    vi.stubEnv('VITE_SPORTSDB_API_KEY', ' my-key ');
    expect(getApiKey()).toBe('my-key');
    expect(getApiBaseUrl()).toBe('https://www.thesportsdb.com/api/v1/json/my-key');
  });
});
