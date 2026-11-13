import type { League } from '../../api/schemas';
import { useSeasonBadge } from '../../hooks/useSeasonBadge';
import { SeasonBadge } from '../SeasonBadge/SeasonBadge';
import styles from './LeagueCard.module.css';

type LeagueCardProps = {
  league: League;
  isExpanded: boolean;
  onToggle: () => void;
};

export function LeagueCard({ league, isExpanded, onToggle }: LeagueCardProps) {
  const badgeQuery = useSeasonBadge(league.idLeague, isExpanded);
  const panelId = `league-panel-${league.idLeague}`;

  return (
    <div className={isExpanded ? `${styles.card} ${styles.expanded}` : styles.card}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={styles.name}>{league.strLeague}</span>
        <span className={styles.chip}>{league.strSport}</span>
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
