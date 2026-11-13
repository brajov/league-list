import { useQuery } from '@tanstack/react-query';
import { getSeasonBadge } from '../api/leagues';

// Only fetches once `enabled` is true (the card is expanded). The result is
// cached per league, so re-opening a card does not hit the network again.
export function useSeasonBadge(leagueId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['seasonBadge', leagueId],
    queryFn: () => getSeasonBadge(leagueId),
    enabled,
  });
}
