import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/constants/ui";
import { PaginationResult } from "@/lib/pagination";

interface PaginationProps {
  pagination: PaginationResult<unknown>;
  className?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  pagination,
  className,
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push(`${pathname}?${createQueryString("page", page.toString())}`, {
        scroll: false,
      });
    }
  };

  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}>
      <p className="text-sm text-muted-foreground">
        {UI_COPY.pagination.showing} {start} {UI_COPY.pagination.of} {end}{" "}
        {UI_COPY.pagination.of} {pagination.total} {UI_COPY.pagination.results}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
        >
          {UI_COPY.actions.previous}
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1)
            )
            .map((page, index, array) => {
              if (index > 0 && array[index - 1] !== page - 1) {
                return (
                  <div key={`ellipsis-${page}`} className="px-2">
                    ...
                  </div>
                );
              }
              return (
                <Button
                  key={page}
                  variant={page === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  aria-current={page === pagination.page ? "page" : undefined}
                >
                  {page}
                </Button>
              );
            })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
        >
          {UI_COPY.actions.next}
        </Button>
      </div>
    </div>
  );
}
