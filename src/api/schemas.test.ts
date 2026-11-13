import { describe, expect, it, vi } from 'vitest';
import { LeaguesResponseSchema, SeasonsResponseSchema } from './schemas';

describe('LeaguesResponseSchema', () => {
  it('parses a valid payload', () => {
    const payload = {
      leagues: [{ idLeague: '4328', strLeague: 'English Premier League', strSport: 'Soccer' }],
    };

    expect(LeaguesResponseSchema.parse(payload).leagues).toEqual([
      { idLeague: '4328', strLeague: 'English Premier League', strSport: 'Soccer' },
    ]);
  });

  it('drops a malformed row and keeps the rest', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const payload = {
      leagues: [
        { idLeague: '4328', strLeague: 'English Premier League', strSport: 'Soccer' },
        { idLeague: 4329, strLeague: null },
      ],
    };

    const result = LeaguesResponseSchema.parse(payload);

    expect(result.leagues).toHaveLength(1);
    expect(result.leagues[0].idLeague).toBe('4328');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('rejects a payload without a leagues array', () => {
    expect(() => LeaguesResponseSchema.parse({ leagues: null })).toThrow();
  });
});

describe('SeasonsResponseSchema', () => {
  it('parses seasons with badges', () => {
    const payload = {
      seasons: [{ strSeason: '1992-1993', strBadge: 'https://example.com/badge.png' }],
    };

    expect(SeasonsResponseSchema.parse(payload).seasons).toEqual(payload.seasons);
  });

  it('accepts seasons: null for an unknown league', () => {
    expect(SeasonsResponseSchema.parse({ seasons: null }).seasons).toBeNull();
  });

  it('accepts a season with a missing or null badge', () => {
    const payload = {
      seasons: [{ strSeason: '1992-1993' }, { strSeason: '1993-1994', strBadge: null }],
    };

    expect(SeasonsResponseSchema.parse(payload).seasons).toHaveLength(2);
  });
});
