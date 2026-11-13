import { describe, expect, it } from 'vitest';
import type { League } from '../api/schemas';
import { getSports } from './getSports';

const leagues: League[] = [
  { idLeague: '1', strLeague: 'English Premier League', strSport: 'Soccer' },
  { idLeague: '2', strLeague: 'Spanish La Liga', strSport: 'Soccer' },
  { idLeague: '3', strLeague: 'NBA', strSport: 'Basketball' },
  { idLeague: '4', strLeague: 'Premier Basketball League', strSport: 'Basketball' },
];

describe('getSports', () => {
  it('returns unique sports sorted alphabetically', () => {
    expect(getSports(leagues)).toEqual(['Basketball', 'Soccer']);
  });

  it('returns a single sport when every league shares it (no dropdown is shown)', () => {
    const soccerOnly = leagues.filter((league) => league.strSport === 'Soccer');
    expect(getSports(soccerOnly)).toEqual(['Soccer']);
  });
});
