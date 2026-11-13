import { useState } from 'react';
import type { League } from '../api/schemas';

// Tracks which league is open in the list. A single result is opened
// automatically, since there is nothing else to choose, but the user can
// still close it, and it is not reopened automatically straight away.
export function useOpenLeague(visibleLeagues: League[]) {
  const [expandedLeagueId, setExpandedLeagueId] = useState<string | null>(null);
  // A league the user closed while it was the only result.
  const [dismissedLeagueId, setDismissedLeagueId] = useState<string | null>(null);

  const singleLeagueId = visibleLeagues.length === 1 ? visibleLeagues[0].idLeague : null;
  const openLeagueId =
    singleLeagueId !== null && singleLeagueId !== dismissedLeagueId
      ? singleLeagueId
      : expandedLeagueId;

  // Toggles what is on screen, so closing an automatically opened league works too.
  function toggleLeague(leagueId: string) {
    const isOpen = leagueId === openLeagueId;
    setExpandedLeagueId(isOpen ? null : leagueId);
    setDismissedLeagueId(isOpen ? leagueId : null);
  }

  return { openLeagueId, toggleLeague };
}
