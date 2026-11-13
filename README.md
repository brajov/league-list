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

The app uses TheSportsDB's free test key (`123`). To use your own, copy
`.env.example` to `.env.local`, set `VITE_SPORTSDB_API_KEY`, and restart
`npm run dev`. A `VITE_*` value is built into the bundle and v1 of the API puts
the key in the URL, so the key is public; a paid key belongs behind a server-side
proxy.

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
    paginate.ts       cuts one page out of the filtered list (tested)
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

- **Caching with React Query.** `staleTime` and `gcTime` are `Infinity`, set once
  in `createQueryClient()`. The league list is fetched once, and each badge is
  fetched the first time its row is opened, then served from cache
  (`['seasonBadge', leagueId]`). The cache lasts until the page is reloaded.
- **Zod at the network boundary.** Types are inferred from the schemas. A malformed
  league row is dropped with a `console.warn` instead of failing the whole list.
- **No automatic retry, and no preloading.** The free key is tightly rate limited,
  so the app only sends a request when the user asks for something. Every error
  state has a Retry button; the badge's button shows "Retrying…" and the message
  changes if the retry fails too.
- **Badge shown inside the row.** One row is open at a time. It shows the first
  season that has a badge, or a loading, "No badge available", error or
  broken-image state, all in a fixed-height frame so the list does not jump.
- **The sport dropdown appears only when the response has more than one sport**,
  as the brief asks.
- **A single search result opens automatically**, and can still be closed.
- **Filtering is local.** Case-insensitive substring match on the name plus an
  exact sport match. No debounce: even 3000 rows filter instantly.
- **Pagination is local too.** `all_leagues.php` has no offset, page or cursor
  parameter (tried: they are ignored) and no paging metadata; the docs list a
  fixed cap of 3000 leagues for a premium key, all in one response. So the app
  filters the whole response and shows 25 rows a page, with Previous / Next and
  "26–50 of 3000". The pager appears only when there is more than one page
  (never with the free key's 10 leagues), a filter change goes back to page 1,
  and the heading count stays the total of all matching leagues.
- **Plain CSS Modules** with one tokens file; filters stack on narrow screens.
- **Tests act like a user.** `App.test.tsx` renders the whole app with the real
  query client and fakes only `fetch`. The filter functions, schemas and API key
  fallback have unit tests.

## Known limitation

The free API key (`123`) returns only 10 leagues, all of them Soccer, so the sport
dropdown is hidden with that key. It appears automatically as soon as the response
contains a second sport (for example with a premium key in `VITE_SPORTSDB_API_KEY`).
To see it with the free key, open the app with `?demo=multi-sport`. That loads
`search_all_leagues.php?c=United%20States` instead, which returns Soccer,
Basketball, Motorsport and American Football leagues with real ids, so their
badges work too.

The free key is also rate limited: TheSportsDB documents 30 requests a minute, but
in testing fewer than 10 in a minute were enough to get HTTP 429. Those responses
carry no CORS header, so the app sees a network error and shows its error state
with Retry. Waiting about a minute clears it.
