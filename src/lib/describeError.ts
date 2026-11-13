import { ApiError } from '../api/client';

// A short hint about why a request failed and what the user can do about it,
// shown after the "Could not load …" message.
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Something unexpected went wrong.';
  }
  switch (error.kind) {
    case 'network':
      // The free key's rate limit also ends up here (see ApiError).
      return 'TheSportsDB could not be reached. Check your connection, or wait a minute if you have made a lot of requests.';
    case 'timeout':
      return 'TheSportsDB took too long to answer.';
    case 'http':
      return error.status === 429
        ? 'Too many requests. Wait a minute and try again.'
        : `TheSportsDB answered with an error (HTTP ${error.status}).`;
    case 'invalid':
      return 'TheSportsDB sent data the app does not understand.';
  }
}
