import { vi } from 'vitest';
import type { League, Season } from '../api/schemas';

// What one endpoint answers: a JSON body, or a failed request.
type Reply<T> = T | 'error';

type FakeApiState = {
  // all_leagues.php
  leagues: Reply<League[]>;
  // search_all_leagues.php?c=United States (the multi-sport demo source)
  countryLeagues: Reply<League[]>;
  // search_all_seasons.php, by league id. A missing id answers `seasons: null`,
  // which is what the real API does for a league it does not know. A promise
  // holds the answer back until it resolves, so a test can look at the app
  // while the request is still in flight.
  seasons: Record<string, Reply<Season[]> | Promise<Reply<Season[]>>>;
};

// Replaces `fetch` with a stand-in for TheSportsDB. The state can be changed
// during a test (for example to make a Retry succeed), and every request is
// recorded so tests can check what the app fetched and how often.
export function fakeApi(initial: Partial<FakeApiState> = {}) {
  const state: FakeApiState = { leagues: [], countryLeagues: [], seasons: {}, ...initial };
  const requests: URL[] = [];

  function respond(reply: Reply<unknown>, wrap: (body: unknown) => unknown) {
    if (reply === 'error') {
      return new Response('Server error', { status: 500 });
    }
    return Response.json(wrap(reply));
  }

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : input);
      requests.push(url);

      if (url.pathname.endsWith('/all_leagues.php')) {
        return respond(state.leagues, (leagues) => ({ leagues }));
      }
      if (url.pathname.endsWith('/search_all_leagues.php')) {
        return respond(state.countryLeagues, (countries) => ({ countries }));
      }
      if (url.pathname.endsWith('/search_all_seasons.php')) {
        const reply = (await state.seasons[url.searchParams.get('id') ?? '']) ?? null;
        return respond(reply, (seasons) => ({ seasons }));
      }
      throw new Error(`Unexpected request: ${url}`);
    }),
  );

  return {
    state,
    // How many requests went to an endpoint, e.g. count('search_all_seasons.php', { id: '4328' }).
    count(endpoint: string, params: Record<string, string> = {}) {
      return requests.filter(
        (url) =>
          url.pathname.endsWith(`/${endpoint}`) &&
          Object.entries(params).every(([key, value]) => url.searchParams.get(key) === value),
      ).length;
    },
  };
}
