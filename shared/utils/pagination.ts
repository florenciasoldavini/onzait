export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

export interface OffsetPageRequest {
  offset?: number;
  pageSize?: number;
}

export interface OffsetPageRange {
  from: number;
  offset: number;
  pageSize: number;
  to: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  nextOffset: number | null;
}

export function getOffsetPageRange({
  offset = 0,
  pageSize = DEFAULT_PAGE_SIZE
}: OffsetPageRequest = {}): OffsetPageRange {
  const normalizedOffset = normalizeInteger(offset, 0);
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, normalizeInteger(pageSize, DEFAULT_PAGE_SIZE))
  );

  return {
    from: normalizedOffset,
    offset: normalizedOffset,
    pageSize: normalizedPageSize,
    // Supabase ranges are inclusive. Fetch one extra row to detect another page.
    to: normalizedOffset + normalizedPageSize
  };
}

export function toPaginatedResult<TItem>(
  rows: TItem[],
  range: OffsetPageRange
): PaginatedResult<TItem> {
  const hasNextPage = rows.length > range.pageSize;

  return {
    items: rows.slice(0, range.pageSize),
    nextOffset: hasNextPage ? range.offset + range.pageSize : null
  };
}

function normalizeInteger(value: number, fallback: number) {
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}
