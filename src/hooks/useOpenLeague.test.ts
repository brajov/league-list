import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { League } from '../api/schemas';
import { useOpenLeague } from './useOpenLeague';

const PREMIER_LEAGUE: League = {
  idLeague: '1',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
};
const LA_LIGA: League = { idLeague: '2', strLeague: 'Spanish La Liga', strSport: 'Soccer' };

function setup(initial: League[]) {
  return renderHook(({ leagues }) => useOpenLeague(leagues), {
    initialProps: { leagues: initial },
  });
}

describe('useOpenLeague', () => {
  it('starts with nothing open when there are several results', () => {
    const { result } = setup([PREMIER_LEAGUE, LA_LIGA]);
    expect(result.current.openLeagueId).toBeNull();
  });

  it('opens and closes a league on toggle', () => {
    const { result } = setup([PREMIER_LEAGUE, LA_LIGA]);
    act(() => result.current.toggleLeague('2'));
    expect(result.current.openLeagueId).toBe('2');
    act(() => result.current.toggleLeague('2'));
    expect(result.current.openLeagueId).toBeNull();
  });

  it('keeps only one league open at a time', () => {
    const { result } = setup([PREMIER_LEAGUE, LA_LIGA]);
    act(() => result.current.toggleLeague('1'));
    act(() => result.current.toggleLeague('2'));
    expect(result.current.openLeagueId).toBe('2');
  });

  it('opens a single result automatically', () => {
    const { result } = setup([PREMIER_LEAGUE]);
    expect(result.current.openLeagueId).toBe('1');
  });

  it('opens the single result when the list narrows to one', () => {
    const { result, rerender } = setup([PREMIER_LEAGUE, LA_LIGA]);
    rerender({ leagues: [LA_LIGA] });
    expect(result.current.openLeagueId).toBe('2');
  });

  it('lets the user close an automatically opened league', () => {
    const { result } = setup([PREMIER_LEAGUE]);
    act(() => result.current.toggleLeague('1'));
    expect(result.current.openLeagueId).toBeNull();
  });

  it('does not reopen a dismissed single result while it stays the only one', () => {
    const { result, rerender } = setup([PREMIER_LEAGUE]);
    act(() => result.current.toggleLeague('1'));
    rerender({ leagues: [PREMIER_LEAGUE] });
    expect(result.current.openLeagueId).toBeNull();
  });

  it('can reopen a dismissed single result by toggling it', () => {
    const { result } = setup([PREMIER_LEAGUE]);
    act(() => result.current.toggleLeague('1'));
    act(() => result.current.toggleLeague('1'));
    expect(result.current.openLeagueId).toBe('1');
  });

  it('opens a different single result automatically after a dismissal', () => {
    const { result, rerender } = setup([PREMIER_LEAGUE]);
    act(() => result.current.toggleLeague('1'));
    rerender({ leagues: [LA_LIGA] });
    expect(result.current.openLeagueId).toBe('2');
  });
});
