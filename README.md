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

## Scripts

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start the Vite dev server                  |
| `npm run build`        | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview`      | Serve the production build locally         |
| `npm test`             | Run the Vitest unit tests once             |
| `npm run lint`         | Lint with oxlint                           |
| `npm run format`       | Format every file with Prettier            |
| `npm run format:check` | Check formatting without writing           |

## Structure: where to change what

```
src/
  main.tsx            QueryClient (cache settings) + render
  App.tsx             filter state (search, sport, expanded league) and page layout
  api/
    schemas.ts        Zod schemas; the League and Season types are inferred from them
    client.ts         fetchJson(url, schema): fetch, check status, validate
    leagues.ts        getLeagues(), getSeasonBadge(leagueId)
  hooks/
    useLeagues.ts     React Query hook for the league list
    useSeasonBadge.ts React Query hook for one league's badge
  lib/
    filterLeagues.ts  pure filter by name + sport (tested)
    getSports.ts      unique sorted sports for the dropdown (tested)
  components/         one folder per component: Component.tsx + Component.module.css
  styles/
    tokens.css        colours, spacing, radii (CSS variables)
    global.css        reset, body, focus ring
```

- New API field or endpoint: `api/schemas.ts`, then `api/leagues.ts`, then a hook in `hooks/`.
- New filter or sort: a pure function in `lib/` (with a test), state in `App.tsx`.
- New UI: a new folder in `components/`.
- Colours or spacing: `styles/tokens.css`.

## Design decisions

- **React Query for fetching and caching.** `staleTime` and `gcTime` are `Infinity`,
  window-focus refetch is off and `retry` is 1, all set once on the `QueryClient`.
  The league list is fetched once. Each badge is fetched the first time its card
  is opened (the query is only enabled while expanded) and served from cache after
  that, keyed by `['seasonBadge', leagueId]`.
- **Zod at the network boundary.** Types are inferred from the schemas, so there is
  no second set of hand-written types. `fetchJson` throws on a non-2xx status or a
  schema mismatch. The `leagues` envelope must be an array, but each row is
  validated on its own: a malformed row is dropped with a `console.warn` instead of
  failing the whole list. `seasons` may be `null` (unknown league id) and `strBadge`
  may be missing or `null`.
- **Badge shown inside the card.** One card is open at a time. The card header is a
  real `<button>` with `aria-expanded`. The badge area shows loading, the first
  season that has a badge (with its season label), "No badge available", or an
  error with Retry.
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
- **Badge preloading.** Resting the pointer on a row (or focusing it) for 150ms
  fetches that league's badge data and image into the cache, so it is ready when
  the row is opened. The short delay stops a sweep across the list from firing a
  request per row and tripping the API's rate limit.
- **Plain CSS Modules** with a single tokens file. The list is a single column of
  rows inside one panel, so opening a row never leaves gaps. Filters stack on
  narrow screens.
- **Few dependencies.** React, React Query and Zod at runtime; Vite, TypeScript,
  Vitest, oxlint and Prettier for tooling. No router, state library or UI kit.

## Known limitation

The free API key (`123`) returns only 10 leagues, all of them Soccer, so the sport
dropdown is hidden with that key. It appears automatically as soon as the response
contains a second sport (for example with a premium key). To see it with the free
key, point `src/api/leagues.ts` at `search_all_leagues.php?c=United%20States`, which
returns Soccer, Basketball, Motorsport and American Football leagues (under a
`countries` key instead of `leagues`, so the schema would need adjusting).

The free key is also rate limited: after a quick burst of requests (roughly 10) the
API answers HTTP 429. Those responses carry no CORS header, so the browser reports
a generic network error and the app shows its normal error state with Retry.
Because responses are cached, each league's badge is requested at most once per
page load.
