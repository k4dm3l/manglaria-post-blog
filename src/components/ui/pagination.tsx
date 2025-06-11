import { Button } from "@/components/ui/button";
import { PaginationResult } from "@/lib/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  pagination: PaginationResult<any>;
  className?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({ pagination, className, onPageChange }: PaginationProps) {
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
      router.push(
        `${pathname}?${createQueryString("page", page.toString())}`,
        { scroll: false }
      );
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} results
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
        >
          Previous
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
          Next
        </Button>
      </div>
    </div>
  );
} 