import { fetchJson } from './client';
import { getApiBaseUrl } from './config';
import {
  CountryLeaguesResponseSchema,
  type League,
  LeaguesResponseSchema,
  type Season,
  SeasonsResponseSchema,
} from './schemas';

// Where the league list comes from.
// - 'all': all_leagues.php, the endpoint from the brief. With the free key it
//   returns 10 leagues, all Soccer, so the sport filter stays hidden.
// - 'multiSport': the US leagues from search_all_leagues.php, which span Soccer,
//   Basketball, Motorsport and American Football. Real ids, so badges work too.
export type LeagueSource = 'all' | 'multiSport';

export async function getLeagues(source: LeagueSource = 'all'): Promise<League[]> {
  if (source === 'multiSport') {
    const url = `${getApiBaseUrl()}/search_all_leagues.php?c=${encodeURIComponent('United States')}`;
    const data = await fetchJson(url, CountryLeaguesResponseSchema);
    return data.countries;
  }
  const data = await fetchJson(`${getApiBaseUrl()}/all_leagues.php`, LeaguesResponseSchema);
  return data.leagues;
}

// Returns the first season that has a badge image, or null if there is none.
export async function getSeasonBadge(leagueId: string): Promise<Season | null> {
  const url = `${getApiBaseUrl()}/search_all_seasons.php?badge=1&id=${encodeURIComponent(leagueId)}`;
  const data = await fetchJson(url, SeasonsResponseSchema);
  return data.seasons?.find((season) => season.strBadge) ?? null;
}
