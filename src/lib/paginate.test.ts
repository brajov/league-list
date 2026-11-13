import { describe, expect, it } from 'vitest';
import { paginate } from './paginate';

const items = Array.from({ length: 23 }, (_, index) => index + 1);

describe('paginate', () => {
  it('returns the first page', () => {
    expect(paginate(items, 1, 10)).toEqual({
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      page: 1,
      pageCount: 3,
      first: 1,
      last: 10,
    });
  });

  it('returns a shorter last page', () => {
    expect(paginate(items, 3, 10)).toMatchObject({ items: [21, 22, 23], first: 21, last: 23 });
  });

  it('clamps a page past the end to the last page', () => {
    expect(paginate(items, 9, 10)).toMatchObject({ page: 3, items: [21, 22, 23] });
  });

  it('clamps a page below 1 to the first page', () => {
    expect(paginate(items, 0, 10)).toMatchObject({ page: 1, first: 1 });
  });

  it('has a single empty page when there are no items', () => {
    expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pageCount: 1, first: 0, last: 0 });
  });

  it('has a single page when everything fits', () => {
    expect(paginate(items, 1, 25)).toMatchObject({ pageCount: 1, first: 1, last: 23 });
  });
});
