"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { PaginationResult } from "@/lib/pagination";
import { LoadingOverlay } from "@/components/ui/loading";

interface DataCardGridProps<T> {
  items: T[];
  loading?: boolean;
  paginationLoading?: boolean;
  pagination: PaginationResult<T>;
  onPageChange: (page: number) => void;
  renderCard: (item: T) => React.ReactNode;
  getItemKey: (item: T) => string;
  emptyMessage?: string;
}

export function DataCardGrid<T>({
  items,
  loading = false,
  paginationLoading = false,
  pagination,
  onPageChange,
  renderCard,
  getItemKey,
  emptyMessage = "No se encontraron resultados.",
}: DataCardGridProps<T>) {
  return (
    <div className="w-full space-y-4">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`card-skeleton-${index}`} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={getItemKey(item)}>{renderCard(item)}</div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      <LoadingOverlay isLoading={paginationLoading}>
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </LoadingOverlay>
    </div>
  );
}
