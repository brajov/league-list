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

## Left out for time

- Component and integration tests (for example React Testing Library with a
  mocked API). Only the pure filter functions and the schemas are unit-tested.
- Debounced search and keeping filters in the URL.
- Showing all of a league's seasons; only the first season with a badge is shown.
- A fallback when a badge image URL fails to load.
- Dark mode and broader visual polish.
- CI configuration and deployment.
