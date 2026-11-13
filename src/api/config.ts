// TheSportsDB's public test key. It works without signing up, but is limited
// to 30 requests a minute and a reduced data set (e.g. 10 leagues).
export const FREE_API_KEY = '123';

// The key comes from VITE_SPORTSDB_API_KEY (set in .env.local, or in the
// environment when building) and falls back to the free key when it is unset
// or blank.
//
// Vite inlines VITE_* values into the JavaScript bundle at build time, so this
// key is public to anyone who opens the app. That is fine for the free key; a
// paid key should go behind a server-side proxy instead (see README).
export function getApiKey(): string {
  return import.meta.env.VITE_SPORTSDB_API_KEY?.trim() || FREE_API_KEY;
}

// v1 of the API takes the key as a path segment.
export function getApiBaseUrl(): string {
  return `https://www.thesportsdb.com/api/v1/json/${encodeURIComponent(getApiKey())}`;
}
