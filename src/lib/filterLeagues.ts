import type { League } from '../api/schemas';

// Value of the sport filter that means "do not filter by sport".
export const ALL_SPORTS = '';

export function filterLeagues(leagues: League[], search: string, sport: string): League[] {
  const query = search.trim().toLowerCase();

  return leagues.filter((league) => {
    const matchesSearch = league.strLeague.toLowerCase().includes(query);
    const matchesSport = sport === ALL_SPORTS || league.strSport === sport;
    return matchesSearch && matchesSport;
  });
}
