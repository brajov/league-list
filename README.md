# League List

A small React + TypeScript single-page app that lists sports leagues from
[TheSportsDB](https://www.thesportsdb.com/), filters them by name and sport, and
shows a season badge when you click a league.

## Run it

Requires Node 22.12+ (or 24+) and npm.

```bash
npm install
npm run dev       # http://localhost:5173
```

**Seeing the sport filter:** the free API key returns only Soccer leagues, so the
sport dropdown stays hidden (it appears only when the response has more than one
sport). Open **http://localhost:5173/?demo=multi-sport** to load the US leagues
instead (Soccer, Basketball, Motorsport, American Football), where it shows.
See [Known limitation](#known-limitation).

## API key

The app uses TheSportsDB's free test key (`123`) unless you give it your own. To
use your own key, copy `.env.example` to `.env.local` (gitignored) and set it:

```bash
cp .env.example .env.local
```

Then set the key in `.env.local`:

```
VITE_SPORTSDB_API_KEY=your-key
```

Restart `npm run dev` after changing it, because Vite reads `.env` files on
startup. For a build, the variable can also come from the environment
(`VITE_SPORTSDB_API_KEY=your-key npm run build`), for example a CI secret. A key
that is unset or blank falls back to `123`. The lookup lives in `src/api/config.ts`.

**The key is not secret.** Vite writes `VITE_*` values into the JavaScript bundle
at build time, and API v1 puts the key in the request URL, so anyone using the app
can read it in the network tab. Vite's docs say not to put API keys in `VITE_*`
variables, and TheSportsDB's docs note that a v1 key is visible to anyone who
looks at the requests. That is acceptable for the
public test key and for a personal demo. For a paid key in production, keep the key
on a server: a small proxy or serverless function holds it in a server-only
environment variable, adds it to the upstream request (v2 takes it as an
`X-API-KEY` header), and the app calls the proxy instead of TheSportsDB. A proxy
also lets you cache responses and rate-limit callers, so one user cannot use up
the key's quota (30 requests a minute on the free key, 100 on premium).

## Scripts

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start the Vite dev server                  |
| `npm run build`        | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview`      | Serve the production build locally         |
| `npm test`             | Run the unit and component tests once      |
| `npm run lint`         | Lint with oxlint                           |
| `npm run format`       | Format every file with Prettier            |
| `npm run format:check` | Check formatting without writing           |

## Structure: where to change what

```
src/
  main.tsx            render
  queryClient.ts      createQueryClient(): cache and retry settings, shared with the tests
  App.tsx             filter and open-league state, and page layout
  api/
    config.ts         API key (VITE_SPORTSDB_API_KEY, else the free key) and base URL (tested)
    schemas.ts        Zod schemas; League and Season types are inferred from them (tested)
    client.ts         fetchJson(url, schema): fetch, check status, validate
    leagues.ts        getLeagues(source), getSeasonBadge(leagueId)
  hooks/
    useLeagues.ts     React Query hook for the league list (reads ?demo=multi-sport)
    useSeasonBadge.ts React Query hook for one league's badge
  lib/
    filterLeagues.ts  pure filter by name + sport (tested)
    getSports.ts      unique sorted sports for the dropdown (tested)
  components/         one folder per component: Component.tsx + Component.module.css
  styles/
    tokens.css        colours, spacing, radii (CSS variables)
    global.css        reset, body, focus ring
  test/
    setup.ts          jest-dom matchers, cleanup after each test
    fakeApi.ts        stands in for fetch: canned TheSportsDB replies, request counts
  App.test.tsx        component tests that drive the app like a user
```

- New API field or endpoint: `api/schemas.ts`, then `api/leagues.ts`, then a hook in `hooks/`.
- New filter or sort: a pure function in `lib/` (with a test), state in `App.tsx`.
- New UI: a new folder in `components/`.
- Colours or spacing: `styles/tokens.css`.

## Design decisions

- **React Query for fetching and caching.** `staleTime` and `gcTime` are `Infinity`
  and window-focus refetch is off, all set once in `createQueryClient()`.
  The league list is fetched once. Each badge is fetched the first time its card
  is opened or preloaded (see below) and served from cache after that, keyed by
  `['seasonBadge', leagueId]`.
- **Zod at the network boundary.** Types are inferred from the schemas, so there is
  no second set of hand-written types. `fetchJson` throws on a non-2xx status or a
  schema mismatch. The `leagues` (or `countries`) envelope must be an array, but each row is
  validated on its own: a malformed row is dropped with a `console.warn` instead of
  failing the whole list. `seasons` may be `null` (unknown league id) and `strBadge`
  may be missing or `null`.
- **No automatic retry.** The free key answers bursts with HTTP 429, and an
  immediate retry would hit the same limit. Every error state has a Retry button,
  so the user decides when to try again.
- **Badge shown inside the card.** One card is open at a time. The card header is a
  real `<button>` with `aria-expanded`. The badge area shows loading, the first
  season that has a badge (with its season label), "No badge available", or an
  error with Retry. If the image itself fails to load, a message replaces it.
- **Filtering is local and synchronous.** Case-insensitive, trimmed substring match
  on the league name, plus an exact sport match. No debounce: the list is small.
- **The sport dropdown appears only when it is useful.** The brief asks for it "if
  multiple sport types appear in the response", so `App.tsx` renders it only when
  `getSports` finds more than one sport. With a single sport it could only offer
  "All sports" and that one sport, which filters nothing.
- **States.** Loading skeleton, error with Retry, and an empty state with a
  "Clear filters" action.
- **A single search result opens automatically.** When the filters leave exactly
  one league, its badge is shown without a click. This is derived in `App.tsx`
  rather than stored, so widening the search restores whatever was open before.
  Clicking the row still closes it, and it stays closed while it remains the only
  result.
- **Badge preloading.** Resting the pointer on a row (or focusing it) for 150ms
  fetches that league's badge data and image into the cache, so it is ready when
  the row is opened. The short delay stops a sweep across the list from firing a
  request per row and tripping the API's rate limit. A pending preload is
  cancelled when the pointer leaves or the row is filtered out.
- **Plain CSS Modules** with a single tokens file. The list is a single column of
  rows inside one panel, so opening a row never leaves gaps. Filters stack on
  narrow screens.
- **Tests act like a user.** `App.test.tsx` renders the whole app with the real
  query client and fakes only `fetch`. Tests find elements by role and visible
  text, and type, click and hover with Testing Library's `user-event`. They cover
  search, the sport filter (hidden and shown), empty and error states with Retry,
  opening a badge, caching (each badge is requested once), the image fallback,
  the single-result auto-open (and closing it), and hover preloading. The pure
  filter functions, the Zod schemas and the API key fallback have their own unit
  tests.
- **Few dependencies.** React, React Query and Zod at runtime; Vite, TypeScript,
  Vitest, Testing Library, jsdom, oxlint and Prettier for tooling. No router,
  state library or UI kit.

## Known limitation

The free API key (`123`) returns only 10 leagues, all of them Soccer, so the sport
dropdown is hidden with that key. It appears automatically as soon as the response
contains a second sport (for example with a premium key in `VITE_SPORTSDB_API_KEY`).
To see it with the free key, open the app with `?demo=multi-sport`. That loads
`search_all_leagues.php?c=United%20States` instead, which returns Soccer,
Basketball, Motorsport and American Football leagues with real ids, so their
badges work too.

The free key is also rate limited. TheSportsDB documents 30 requests a minute, but
a quick burst of roughly 10 already got HTTP 429 in testing. Those responses carry
no CORS header, so the browser reports a generic network error and the app shows
its normal error state with Retry. Because responses are cached, a league's badge
is not requested again once it has loaded.
