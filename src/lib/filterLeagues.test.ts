import { describe, expect, it } from 'vitest';
import type { League } from '../api/schemas';
import { ALL_SPORTS, filterLeagues } from './filterLeagues';
import { getSports } from './getSports';

const leagues: League[] = [
  { idLeague: '1', strLeague: 'English Premier League', strSport: 'Soccer' },
  { idLeague: '2', strLeague: 'Spanish La Liga', strSport: 'Soccer' },
  { idLeague: '3', strLeague: 'NBA', strSport: 'Basketball' },
  { idLeague: '4', strLeague: 'Premier Basketball League', strSport: 'Basketball' },
];

function names(result: League[]): string[] {
  return result.map((league) => league.strLeague);
}

describe('filterLeagues', () => {
  it('returns every league when no filter is set', () => {
    expect(filterLeagues(leagues, '', ALL_SPORTS)).toHaveLength(4);
  });

  it('filters by league name, case-insensitive and trimmed', () => {
    expect(names(filterLeagues(leagues, '  premier ', ALL_SPORTS))).toEqual([
      'English Premier League',
      'Premier Basketball League',
    ]);
  });

  it('filters by sport', () => {
    expect(names(filterLeagues(leagues, '', 'Basketball'))).toEqual([
      'NBA',
      'Premier Basketball League',
    ]);
  });

  it('combines search and sport', () => {
    expect(names(filterLeagues(leagues, 'premier', 'Soccer'))).toEqual(['English Premier League']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterLeagues(leagues, 'cricket', ALL_SPORTS)).toEqual([]);
  });
});

describe('getSports', () => {
  it('returns unique sports sorted alphabetically', () => {
    expect(getSports(leagues)).toEqual(['Basketball', 'Soccer']);
  });

  it('returns a single sport when every league shares it (no dropdown is shown)', () => {
    const soccerOnly = leagues.filter((league) => league.strSport === 'Soccer');
    expect(getSports(soccerOnly)).toEqual(['Soccer']);
  });
});
