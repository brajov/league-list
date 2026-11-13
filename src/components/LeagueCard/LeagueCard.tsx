import { useRef } from 'react';
import type { League } from '../../api/schemas';
import { usePrefetchSeasonBadge, useSeasonBadge } from '../../hooks/useSeasonBadge';
import { SeasonBadge } from '../SeasonBadge/SeasonBadge';
import styles from './LeagueCard.module.css';

// How long the pointer must rest on a card before its badge is preloaded.
// Stops a quick sweep across the list from firing a request per card, which
// would trip the API's rate limit.
const PREFETCH_DELAY_MS = 150;

type LeagueCardProps = {
  league: League;
  isExpanded: boolean;
  onToggle: () => void;
};

export function LeagueCard({ league, isExpanded, onToggle }: LeagueCardProps) {
  const badgeQuery = useSeasonBadge(league.idLeague, isExpanded);
  const prefetchSeasonBadge = usePrefetchSeasonBadge();
  const prefetchTimer = useRef<number | undefined>(undefined);
  const panelId = `league-panel-${league.idLeague}`;

  function schedulePrefetch() {
    prefetchTimer.current = window.setTimeout(
      () => prefetchSeasonBadge(league.idLeague),
      PREFETCH_DELAY_MS,
    );
  }

  function cancelPrefetch() {
    window.clearTimeout(prefetchTimer.current);
  }

  return (
    <div className={isExpanded ? `${styles.card} ${styles.expanded}` : styles.card}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={onToggle}
        onMouseEnter={schedulePrefetch}
        onMouseLeave={cancelPrefetch}
        onFocus={schedulePrefetch}
        onBlur={cancelPrefetch}
      >
        <span className={styles.name}>{league.strLeague}</span>
        <span className={styles.sport}>{league.strSport}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

      {isExpanded && (
        <div id={panelId} className={styles.panel}>
          <SeasonBadge
            leagueName={league.strLeague}
            season={badgeQuery.data}
            isLoading={badgeQuery.isPending || badgeQuery.isFetching}
            isError={badgeQuery.isError}
            onRetry={() => badgeQuery.refetch()}
          />
        </div>
      )}
    </div>
  );
}
