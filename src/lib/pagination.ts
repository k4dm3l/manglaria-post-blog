export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function calculatePagination<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = 10
): PaginationParams {
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || defaultLimit;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Limit between 1 and 100
  };
} 