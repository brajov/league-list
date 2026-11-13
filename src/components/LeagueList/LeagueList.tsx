import type { League } from '../../api/schemas';
import { LeagueCard } from '../LeagueCard/LeagueCard';
import styles from './LeagueList.module.css';

type LeagueListProps = {
  leagues: League[];
  expandedLeagueId: string | null;
  onToggleLeague: (leagueId: string) => void;
};

export function LeagueList({ leagues, expandedLeagueId, onToggleLeague }: LeagueListProps) {
  return (
    <ul className={styles.list}>
      {leagues.map((league) => (
        <li key={league.idLeague}>
          <LeagueCard
            league={league}
            isExpanded={league.idLeague === expandedLeagueId}
            onToggle={() => onToggleLeague(league.idLeague)}
          />
        </li>
      ))}
    </ul>
  );
}
