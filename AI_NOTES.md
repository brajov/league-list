# AI usage notes

## Tools used

Claude Code (Anthropic) was used for planning, scaffolding and implementation,
under the author's direction and review:

- **Planning:** checking what the two TheSportsDB endpoints actually return
  (shape, the 10-league / Soccer-only limit of the free key, `seasons: null` for
  unknown ids, CORS) and agreeing the stack and folder structure.
- **Scaffolding:** creating the Vite React + TypeScript project, removing the
  template boilerplate and adding Prettier for formatting.
- **Implementation:** the API layer, hooks, filter functions, components, styles,
  unit tests and these docs, following the agreed plan.
- **Review:** checking the app against the brief, which led to:
  - the `?demo=multi-sport` switch, so the sport filter can be seen with the free key;
  - a fix so a league opened automatically (single search result) can be closed;
  - the badge image fallback;
  - no automatic retry on rate-limited requests;
  - removing badge preloading on hover, which used up the API's rate limit;
  - a Retry button on the badge that shows it is working and says when it failed again;
  - component tests that drive the app like a user, run against deliberately
    broken code to make sure they fail.
- **Follow-up review:** an analysis of possible improvements, which led to:
  - pagination buttons that keep keyboard focus at the first and last page;
  - typed API errors with a request time limit, and a reason shown with the
    league list error;
  - an error boundary, accent-insensitive search and the `jsx-a11y` and
    `exhaustive-deps` lint rules;
  - the "Future improvements" list in the README.
- **API key handling:** researching how to configure keys in a Vite app (Vite's
  env docs, TheSportsDB's docs on how keys are passed). This led to reading the key
  from `VITE_SPORTSDB_API_KEY` with the free key as the fallback, an `.env.example`,
  and a README note that a key in a browser bundle is public, so a paid key belongs
  behind a server-side proxy.

## Left out for time

See "Future improvements" in the README for the full list. The main ones:

- A server-side proxy, a persisted cache and filters in the URL.
- Pagination beyond Previous / Next, for a premium key's 3000 leagues.
- Showing all of a league's seasons; only the first season with a badge is shown.
- Dark mode and broader visual polish.
- CI configuration and deployment.
