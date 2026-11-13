import { useQuery } from '@tanstack/react-query';
import { getLeagues, type LeagueSource } from '../api/leagues';

// `?demo=multi-sport` switches to a multi-sport league list, so the sport
// filter can be seen with the free API key (see README, "Known limitation").
function getLeagueSource(): LeagueSource {
  const demo = new URLSearchParams(window.location.search).get('demo');
  return demo === 'multi-sport' ? 'multiSport' : 'all';
}

export function useLeagues() {
  const source = getLeagueSource();
  return useQuery({
    queryKey: ['leagues', source],
    queryFn: () => getLeagues(source),
  });
}
