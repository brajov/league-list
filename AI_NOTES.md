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
- **Review:** checking the app against the brief, which led to the
  `?demo=multi-sport` switch, the badge image fallback, no automatic retry on
  rate-limited requests, a fix for the hover-preload timer, and component tests
  that drive the app like a user (run against deliberately broken code to make
  sure they fail).

## Left out for time

- Debounced search and keeping filters in the URL.
- Showing all of a league's seasons; only the first season with a badge is shown.
- Dark mode and broader visual polish.
- CI configuration and deployment.
