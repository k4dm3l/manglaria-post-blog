import { useState, useEffect, useCallback } from "react";
import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { columns as defaultColumns, BlogPost } from "./BlogPostTableColumns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "./error-boundary";
import { LoadingTable, LoadingSearch, LoadingOverlay } from "./ui/loading";
import { Pagination } from "./ui/pagination";
import { PaginationResult } from "@/lib/pagination";
import { useDebounce } from "@/lib/hooks";

export function BlogPostTable() {
  const { data: session } = useSession();
  const [data, setData] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationResult<BlogPost>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  const fetchBlogPosts = useCallback(async (page: number, limit: number, search: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/blogs?page=${page}&limit=${limit}&search=${search}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      const result = await response.json();
      setData(result.data.items);
      setPagination({
        items: result.data.items,
        total: result.data.total,
        page: result.data.page,
        limit: result.data.limit,
        totalPages: result.data.totalPages,
        hasNextPage: result.data.page < result.data.totalPages,
        hasPreviousPage: result.data.page > 1
      });
    } catch (error) {
      console.error("Error fetching Blog Posts:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearchLoading(true);
    }
    fetchBlogPosts(pagination.page, pagination.limit, debouncedSearch)
      .catch(console.error)
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch, pagination.page, pagination.limit, fetchBlogPosts, search]);

  const handlePageChange = async (newPage: number) => {
    setPaginationLoading(true);
    try {
      await fetchBlogPosts(newPage, pagination.limit, debouncedSearch);
    } finally {
      setPaginationLoading(false);
    }
  };

  const handleToggleDelete = async (blogPostId: string, isDeleted: boolean) => {
    try {
      const response = await fetch(`/api/blogs/${blogPostId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDeleted }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el estado del blog post");
      }

      await fetchBlogPosts(pagination.page, pagination.limit, debouncedSearch);
    } catch (error: unknown) {
      console.error("Error al actualizar el estado del blog post:", error instanceof Error ? error.message : 'Unknown error');
      alert(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const columns = defaultColumns(handleToggleDelete);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <ErrorBoundary>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <div className="relative max-w-sm">
            <Input
              placeholder="Buscar por titulo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pr-8"
            />
            {searchLoading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <LoadingSearch />
              </div>
            )}
          </div>
          {session?.user.role === 'admin' && (
            <Button onClick={() => router.push(`/editor`)}>
              Crear blog post
            </Button>
          )}
        </div>
        <LoadingOverlay isLoading={loading}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24">
                      <LoadingTable />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </LoadingOverlay>
        <div className="relative mt-4">
          <LoadingOverlay isLoading={paginationLoading}>
            <Pagination 
              pagination={pagination} 
              onPageChange={handlePageChange}
            />
          </LoadingOverlay>
        </div>
      </div>
    </ErrorBoundary>
  );
}