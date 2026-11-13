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
export function Pagination({ page, pageCount, first, last, total, onPageChange }: PaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
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
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
      </button>
    </nav>
  );
}
