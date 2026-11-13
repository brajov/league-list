import styles from './StatusMessage.module.css';

type StatusMessageProps = {
  variant: 'loading' | 'empty' | 'error';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const SKELETON_CARD_COUNT = 6;

// Shared display for the list's loading, empty and error states.
export function StatusMessage({ variant, message, actionLabel, onAction }: StatusMessageProps) {
  if (variant === 'loading') {
    return (
      <div role="status">
        <span className={styles.visuallyHidden}>{message}</span>
        <div className={styles.skeletonGrid} aria-hidden="true">
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            // Index keys are fine here: static placeholders that never reorder.
            <div key={index} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.box} role={variant === 'error' ? 'alert' : 'status'}>
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
