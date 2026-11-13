import { useState } from 'react';
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
  // The URL of an image that failed to load. Storing the URL rather than a
  // boolean means a different badge URL gets its own attempt.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

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

  const badgeUrl = season.strBadge;
  if (failedSrc === badgeUrl) {
    return <p className={styles.message}>The badge image could not be loaded.</p>;
  }

  return (
    <figure className={styles.figure}>
      <img
        className={styles.image}
        src={badgeUrl}
        alt={`${leagueName} badge, ${season.strSeason} season`}
        width={128}
        height={128}
        onError={() => setFailedSrc(badgeUrl)}
      />
      <figcaption className={styles.caption}>Season {season.strSeason}</figcaption>
    </figure>
  );
}
