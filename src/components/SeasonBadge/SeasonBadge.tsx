import { useEffect, useRef, useState } from 'react';
import type { Season } from '../../api/schemas';
import styles from './SeasonBadge.module.css';

// The shortest time the Retry button shows "Retrying…" after a click.
const MIN_RETRY_MS = 500;

type SeasonBadgeProps = {
  leagueName: string;
  season: Season | null | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

// Every state is wrapped in the same fixed-size frame, so swapping one state
// for another does not change the panel's height.
export function SeasonBadge(props: SeasonBadgeProps) {
  return (
    <div className={styles.frame}>
      <SeasonBadgeContent {...props} />
    </div>
  );
}

function SeasonBadgeContent({ leagueName, season, isLoading, isError, onRetry }: SeasonBadgeProps) {
  // The URL of an image that failed to load. Storing the URL rather than a
  // boolean means a different badge URL gets its own attempt.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // Set once the user clicks Retry. React Query clears the error as soon as
  // the new request starts, so without this the error would swap to the
  // loading state and back again on every failed retry.
  const [hasRetried, setHasRetried] = useState(false);
  // True for a short while after each Retry click. The API often fails within
  // a few milliseconds, which would flip the button back before anyone saw it.
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  // A retry that succeeds shows the badge straight away; only a failed one is
  // held, so the user sees that it ran.
  const isRetrying = hasRetried && (isLoading || (isError && isHolding));

  function retry() {
    // The button is only aria-disabled while busy (see below), so it still
    // receives clicks; ignore them until the current attempt is over.
    if (isRetrying) return;
    setHasRetried(true);
    setIsHolding(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setIsHolding(false), MIN_RETRY_MS);
    onRetry();
  }

  if (isError || isRetrying) {
    return (
      <div className={styles.message} role="alert">
        {/* New wording after a failed retry, so it is clear (and announced) that it ran. */}
        <p>
          {hasRetried && !isRetrying
            ? 'Still could not load the badge.'
            : 'Could not load the badge.'}
        </p>
        {/* aria-disabled rather than disabled: a disabled button loses keyboard
            focus, so a keyboard user would be dropped back to the top of the
            page and the "Retrying…" label would go unannounced. */}
        <button type="button" className={styles.retry} aria-disabled={isRetrying} onClick={retry}>
          {isRetrying ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    );
  }

  if (isLoading) {
    // Same layout as the loaded badge: a placeholder where the image goes and
    // the loading text where the caption goes.
    return (
      <div className={`${styles.figure} ${styles.loading}`} role="status">
        <div className={styles.placeholder} aria-hidden="true" />
        <p className={styles.caption}>Loading badge…</p>
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
