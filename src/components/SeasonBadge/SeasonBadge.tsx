import type { Season } from '../../api/schemas';
import styles from './SeasonBadge.module.css';

type SeasonBadgeProps = {
  leagueName: string;
  season: Season | null | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function SeasonBadge({ leagueName, season, isLoading, isError, onRetry }: SeasonBadgeProps) {
  if (isLoading) {
    return (
      <p className={styles.message} role="status">
        Loading badge…
      </p>
    );
  }

  if (isError) {
    return (
      <div className={styles.message} role="alert">
        <p>Could not load the badge.</p>
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  if (!season?.strBadge) {
    return <p className={styles.message}>No badge available</p>;
  }

  return (
    <figure className={styles.figure}>
      <img
        className={styles.image}
        src={season.strBadge}
        alt={`${leagueName} badge, ${season.strSeason} season`}
        width={160}
        height={160}
      />
      <figcaption className={styles.caption}>Season {season.strSeason}</figcaption>
    </figure>
  );
}
