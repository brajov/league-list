import type { League } from '../api/schemas';

// Unique sport names, sorted alphabetically, for the sport dropdown.
export function getSports(leagues: League[]): string[] {
  const sports = new Set(leagues.map((league) => league.strSport));
  return [...sports].sort((a, b) => a.localeCompare(b));
}
