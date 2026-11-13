import type { League } from '../api/schemas';

// Value of the sport filter that means "do not filter by sport".
export const ALL_SPORTS = '';

// Lower-cases and strips accents, so "brasileirao" finds "Brasileirão".
// NFD splits a letter from its accent; \p{M} matches the accent marks.
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function filterLeagues(leagues: League[], search: string, sport: string): League[] {
  const query = normalize(search.trim());

  return leagues.filter((league) => {
    const matchesSearch = normalize(league.strLeague).includes(query);
    const matchesSport = sport === ALL_SPORTS || league.strSport === sport;
    return matchesSearch && matchesSport;
  });
}
