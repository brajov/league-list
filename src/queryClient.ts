import { QueryClient } from '@tanstack/react-query';

// League data and badges do not change while the page is open, so every
// response is cached for the lifetime of the page and never refetched.
//
// No automatic retry: the free API key answers bursts with HTTP 429, and an
// immediate retry would only hit the same limit again. Every error state has a
// Retry button instead, so the user decides when to try again.
//
// The app and the component tests both build their client here, so the tests
// run against the real cache settings.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
}
