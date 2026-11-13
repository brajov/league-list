export type Page<T> = {
  items: T[];
  // 1-based, clamped to the pages that exist.
  page: number;
  pageCount: number;
  // 1-based positions of the first and last item on the page, for "21–40 of 95".
  // Both are 0 when there are no items.
  first: number;
  last: number;
};

// Cuts one page out of a list. A page past the end (for example after a filter
// shrank the list) is clamped to the last page, so the result is never empty
// while there are items.
export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page)), pageCount);
  const start = (current - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    page: current,
    pageCount,
    first: pageItems.length > 0 ? start + 1 : 0,
    last: start + pageItems.length,
  };
}
