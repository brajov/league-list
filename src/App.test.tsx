import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { League } from './api/schemas';
import { App } from './App';
import { createQueryClient } from './queryClient';
import { fakeApi } from './test/fakeApi';

// These tests drive the whole app the way a user would: find things by their
// role and visible text, type, click and hover. Only the network is faked.

const PREMIER_LEAGUE: League = {
  idLeague: '4328',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
};
const LA_LIGA: League = { idLeague: '4335', strLeague: 'Spanish La Liga', strSport: 'Soccer' };
const BUNDESLIGA: League = { idLeague: '4331', strLeague: 'German Bundesliga', strSport: 'Soccer' };
const NBA: League = { idLeague: '4387', strLeague: 'NBA', strSport: 'Basketball' };
const INDYCAR: League = { idLeague: '4373', strLeague: 'IndyCar Series', strSport: 'Motorsport' };

const SOCCER_LEAGUES = [PREMIER_LEAGUE, LA_LIGA, BUNDESLIGA];
const MIXED_LEAGUES = [PREMIER_LEAGUE, NBA, INDYCAR, LA_LIGA];

// The first season has no badge, so the app has to pick the second one.
const PREMIER_LEAGUE_SEASONS = [
  { strSeason: '1992-1993', strBadge: null },
  { strSeason: '1993-1994', strBadge: 'https://example.com/epl-1993.png' },
  { strSeason: '1994-1995', strBadge: 'https://example.com/epl-1994.png' },
];

function renderApp() {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={createQueryClient()}>
      <App />
    </QueryClientProvider>,
  );
  return user;
}

// Each league row is a button named after the league (its text also holds the sport).
function leagueRow(name: string | RegExp) {
  return screen.getByRole('button', { name });
}

async function findLeagueRows() {
  const list = await screen.findByRole('list');
  return within(list).getAllByRole('button');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('league list', () => {
  it('shows every league with its sport', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES });
    renderApp();

    expect(screen.getByRole('status')).toHaveTextContent('Loading leagues…');

    const rows = await findLeagueRows();
    expect(rows.map((row) => row.textContent)).toEqual([
      'English Premier LeagueSoccer',
      'Spanish La LigaSoccer',
      'German BundesligaSoccer',
    ]);
    expect(screen.getByRole('heading', { name: /All Leagues\s*\(3\)/ })).toBeInTheDocument();
  });

  it('shows an error with Retry when the leagues fail to load, and recovers', async () => {
    const api = fakeApi({ leagues: 'error' });
    const user = renderApp();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load leagues.');

    api.state.leagues = SOCCER_LEAGUES;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await findLeagueRows()).toHaveLength(3);
    expect(api.count('all_leagues.php')).toBe(2);
  });
});

describe('search', () => {
  it('narrows the list by league name, ignoring case', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES });
    const user = renderApp();
    await findLeagueRows();

    await user.type(screen.getByRole('searchbox', { name: 'Search leagues' }), 'LEAGUE');

    expect((await findLeagueRows()).map((row) => row.textContent)).toEqual([
      'English Premier LeagueSoccer',
    ]);
  });

  it('says when nothing matches and lets the user clear the filters', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES });
    const user = renderApp();
    await findLeagueRows();
    const search = screen.getByRole('searchbox', { name: 'Search leagues' });

    await user.type(search, 'cricket');

    expect(screen.getByText('No leagues match your filters.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /All Leagues\s*\(0\)/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(search).toHaveValue('');
    expect(await findLeagueRows()).toHaveLength(3);
  });
});

describe('sport filter', () => {
  it('is hidden when every league is the same sport', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES });
    renderApp();
    await findLeagueRows();

    expect(screen.queryByRole('combobox', { name: 'Sport' })).not.toBeInTheDocument();
  });

  it('appears with each sport once when the leagues span several sports', async () => {
    fakeApi({ leagues: MIXED_LEAGUES });
    renderApp();

    const select = await screen.findByRole('combobox', { name: 'Sport' });
    const options = within(select).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'All sports',
      'Basketball',
      'Motorsport',
      'Soccer',
    ]);
  });

  it('filters by sport and combines with the search', async () => {
    fakeApi({ leagues: MIXED_LEAGUES });
    const user = renderApp();

    await user.selectOptions(await screen.findByRole('combobox', { name: 'Sport' }), 'Soccer');
    expect(await findLeagueRows()).toHaveLength(2);

    await user.type(screen.getByRole('searchbox', { name: 'Search leagues' }), 'liga');
    expect((await findLeagueRows()).map((row) => row.textContent)).toEqual([
      'Spanish La LigaSoccer',
    ]);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sport' }), 'Basketball');
    expect(screen.getByText('No leagues match your filters.')).toBeInTheDocument();
  });

  it('can be seen with the free API key through ?demo=multi-sport', async () => {
    window.history.replaceState(null, '', '/?demo=multi-sport');
    const api = fakeApi({ countryLeagues: MIXED_LEAGUES });
    renderApp();

    expect(await screen.findByRole('combobox', { name: 'Sport' })).toBeInTheDocument();
    expect(api.count('search_all_leagues.php', { c: 'United States' })).toBe(1);
    expect(api.count('all_leagues.php')).toBe(0);
  });
});

describe('season badge', () => {
  it('opens on click and shows the first season that has a badge', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': PREMIER_LEAGUE_SEASONS } });
    const user = renderApp();
    await findLeagueRows();
    const row = leagueRow(/English Premier League/);

    expect(row).toHaveAttribute('aria-expanded', 'false');
    await user.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');

    const badge = await screen.findByRole('img', {
      name: 'English Premier League badge, 1993-1994 season',
    });
    expect(badge).toHaveAttribute('src', 'https://example.com/epl-1993.png');
    expect(screen.getByText('Season 1993-1994')).toBeInTheDocument();
  });

  it('keeps one league open at a time', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': PREMIER_LEAGUE_SEASONS } });
    const user = renderApp();
    await findLeagueRows();

    await user.click(leagueRow(/English Premier League/));
    await user.click(leagueRow(/Spanish La Liga/));

    expect(leagueRow(/English Premier League/)).toHaveAttribute('aria-expanded', 'false');
    expect(leagueRow(/Spanish La Liga/)).toHaveAttribute('aria-expanded', 'true');
  });

  it('is fetched once per league and served from the cache after that', async () => {
    const api = fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': PREMIER_LEAGUE_SEASONS } });
    const user = renderApp();
    await findLeagueRows();
    const row = leagueRow(/English Premier League/);

    await user.click(row);
    await screen.findByRole('img');
    await user.click(row); // close
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    await user.click(row); // open again

    // Shown straight away from the cache, with no loading state in between.
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(api.count('search_all_seasons.php', { id: '4328' })).toBe(1);
  });

  it('says so when the league has no badge', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES, seasons: {} });
    const user = renderApp();
    await findLeagueRows();

    await user.click(leagueRow(/German Bundesliga/));

    expect(await screen.findByText('No badge available')).toBeInTheDocument();
  });

  it('shows an error with Retry when the badge request fails, and recovers', async () => {
    const api = fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': 'error' } });
    const user = renderApp();
    await findLeagueRows();

    await user.click(leagueRow(/English Premier League/));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the badge.');

    api.state.seasons['4328'] = PREMIER_LEAGUE_SEASONS;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('img')).toBeInTheDocument();
    expect(api.count('search_all_seasons.php', { id: '4328' })).toBe(2);
  });

  it('keeps the error on screen while a retry is in flight', async () => {
    const api = fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': 'error' } });
    const user = renderApp();
    await findLeagueRows();

    await user.click(leagueRow(/English Premier League/));
    await screen.findByRole('alert');

    let answer: (reply: typeof PREMIER_LEAGUE_SEASONS) => void = () => {};
    api.state.seasons['4328'] = new Promise((resolve) => (answer = resolve));
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    // The error stays put, with the button busy, instead of switching to the loading state.
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the badge.');
    const button = screen.getByRole('button', { name: 'Retrying…' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // The busy button keeps focus, and pressing it again does not send another request.
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(api.count('search_all_seasons.php', { id: '4328' })).toBe(2);

    answer(PREMIER_LEAGUE_SEASONS);
    expect(await screen.findByRole('img')).toBeInTheDocument();
  });

  it('shows that a failed retry ran, even when the API fails instantly', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': 'error' } });
    const user = renderApp();
    await findLeagueRows();

    await user.click(leagueRow(/English Premier League/));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the badge.');
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    // The fake API has already failed again, but the button stays busy for a moment.
    const button = screen.getByRole('button', { name: 'Retrying…' });
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // Then it is ready again, with wording that says the retry did not help.
    // It is the same button, still focused, so a keyboard user can retry again.
    await waitFor(() => expect(button).toHaveAccessibleName('Retry'));
    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(button).toHaveFocus();
    expect(screen.getByRole('alert')).toHaveTextContent('Still could not load the badge.');
  });

  it('falls back to a message when the badge image itself fails to load', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': PREMIER_LEAGUE_SEASONS } });
    const user = renderApp();
    await findLeagueRows();

    await user.click(leagueRow(/English Premier League/));
    // jsdom does not download images, so the browser's failed load is simulated.
    fireEvent.error(await screen.findByRole('img'));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('The badge image could not be loaded.')).toBeInTheDocument();
  });

  it('opens automatically when the search leaves a single league', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': PREMIER_LEAGUE_SEASONS } });
    const user = renderApp();
    await findLeagueRows();

    await user.type(screen.getByRole('searchbox', { name: 'Search leagues' }), 'premier');

    expect(leagueRow(/English Premier League/)).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('img')).toBeInTheDocument();
  });

  it('can be closed and reopened after opening automatically', async () => {
    fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': PREMIER_LEAGUE_SEASONS } });
    const user = renderApp();
    await findLeagueRows();
    const search = screen.getByRole('searchbox', { name: 'Search leagues' });

    await user.type(search, 'premier');
    await screen.findByRole('img');

    await user.click(leagueRow(/English Premier League/));
    expect(leagueRow(/English Premier League/)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    // Typing more that still leaves the same league does not reopen it.
    await user.type(search, ' league');
    expect(leagueRow(/English Premier League/)).toHaveAttribute('aria-expanded', 'false');

    await user.click(leagueRow(/English Premier League/));
    expect(leagueRow(/English Premier League/)).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('is preloaded when the pointer rests on a row', async () => {
    const api = fakeApi({ leagues: SOCCER_LEAGUES, seasons: { '4328': PREMIER_LEAGUE_SEASONS } });
    const user = renderApp();
    await findLeagueRows();

    await user.hover(leagueRow(/English Premier League/));
    await waitFor(() => expect(api.count('search_all_seasons.php', { id: '4328' })).toBe(1));

    await user.click(leagueRow(/English Premier League/));

    // Already cached: shown at once and not requested again.
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(api.count('search_all_seasons.php', { id: '4328' })).toBe(1);
  });

  it('is not preloaded when the pointer only passes over rows', async () => {
    const api = fakeApi({ leagues: SOCCER_LEAGUES });
    const user = renderApp();
    await findLeagueRows();

    for (const name of [/English Premier League/, /Spanish La Liga/, /German Bundesliga/]) {
      await user.hover(leagueRow(name));
      await user.unhover(leagueRow(name));
    }
    await sleep(200); // longer than the preload delay

    expect(api.count('search_all_seasons.php')).toBe(0);
  });
});
