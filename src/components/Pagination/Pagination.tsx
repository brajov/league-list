import styles from './Pagination.module.css';

type PaginationProps = {
  page: number;
  pageCount: number;
  first: number;
  last: number;
  total: number;
  onPageChange: (page: number) => void;
};

// Previous / Next controls under the list. Rendered only when there is more
// than one page.
//
// The buttons are aria-disabled rather than disabled at the ends: a disabled
// button loses keyboard focus, so pressing Next onto the last page would drop
// a keyboard user back to the top of the document.
export function Pagination({ page, pageCount, first, last, total, onPageChange }: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= pageCount;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.button}
        aria-disabled={isFirst}
        onClick={() => !isFirst && onPageChange(page - 1)}
      >
        Previous
      </button>
      <p className={styles.summary} aria-live="polite">
        {first}–{last} of {total}
        <span className={styles.pageLabel}>
          {' '}
          · Page {page} of {pageCount}
        </span>
      </p>
      <button
        type="button"
        className={styles.button}
        aria-disabled={isLast}
        onClick={() => !isLast && onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
