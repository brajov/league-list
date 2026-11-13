import { fetchJson } from './client';
import { type League, LeaguesResponseSchema, type Season, SeasonsResponseSchema } from './schemas';

// "123" is TheSportsDB's public free API key.
const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';

export async function getLeagues(): Promise<League[]> {
  const data = await fetchJson(`${BASE_URL}/all_leagues.php`, LeaguesResponseSchema);
  return data.leagues;
}

// Returns the first season that has a badge image, or null if there is none.
export async function getSeasonBadge(leagueId: string): Promise<Season | null> {
  const url = `${BASE_URL}/search_all_seasons.php?badge=1&id=${encodeURIComponent(leagueId)}`;
  const data = await fetchJson(url, SeasonsResponseSchema);
  return data.seasons?.find((season) => season.strBadge) ?? null;
}
