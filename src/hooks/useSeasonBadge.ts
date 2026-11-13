import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSeasonBadge } from '../api/leagues';

// One definition of the badge query, shared by the hook and the prefetch below
// so both read and write the same cache entry.
function seasonBadgeQuery(leagueId: string) {
  return {
    queryKey: ['seasonBadge', leagueId],
    queryFn: () => getSeasonBadge(leagueId),
  };
}

// Only fetches once `enabled` is true (the card is expanded). The result is
// cached per league, so re-opening a card does not hit the network again.
export function useSeasonBadge(leagueId: string, enabled: boolean) {
  return useQuery({ ...seasonBadgeQuery(leagueId), enabled });
}

// Returns a function that warms the cache for one league: it fetches the badge
// data (skipped if already cached) and then asks the browser to download the
// image, so the badge is ready by the time the card is opened.
export function usePrefetchSeasonBadge() {
  const queryClient = useQueryClient();

  return async function prefetchSeasonBadge(leagueId: string) {
    try {
      const season = await queryClient.ensureQueryData(seasonBadgeQuery(leagueId));
      if (season?.strBadge) {
        new Image().src = season.strBadge;
      }
    } catch {
      // Ignore: the card shows the error and a Retry button when it is opened.
    }
  };
}
