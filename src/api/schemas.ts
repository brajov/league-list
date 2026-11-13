import { z } from 'zod';

export const LeagueSchema = z.object({
  idLeague: z.string(),
  strLeague: z.string(),
  strSport: z.string(),
});

export type League = z.infer<typeof LeagueSchema>;

// The envelope must match, but each row is checked on its own so that one
// malformed league is dropped instead of failing the whole list.
const LeagueRowsSchema = z.array(z.unknown()).transform((rows) =>
  rows.flatMap((row) => {
    const result = LeagueSchema.safeParse(row);
    if (!result.success) {
      console.warn('Dropping malformed league row', row, result.error.issues);
      return [];
    }
    return [result.data];
  }),
);

export const LeaguesResponseSchema = z.object({
  leagues: LeagueRowsSchema,
});

// search_all_leagues.php returns the same rows, with more fields, under `countries`.
export const CountryLeaguesResponseSchema = z.object({
  countries: LeagueRowsSchema,
});

export const SeasonSchema = z.object({
  strSeason: z.string(),
  strBadge: z.string().nullish(),
});

export type Season = z.infer<typeof SeasonSchema>;

// The API returns { seasons: null } (HTTP 200) for an unknown league id.
export const SeasonsResponseSchema = z.object({
  seasons: z.array(SeasonSchema).nullable(),
});
