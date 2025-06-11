import { useState, useEffect } from "react";
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
import { columns as defaultColumns, Project } from "./ProjectsTableColumns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoadingTable, LoadingSearch, LoadingOverlay } from "./ui/loading";
import { useDebounce } from "@/lib/hooks";

export function ProjectTable() {
  const { data: session } = useSession();
  const [data, setData] = useState<Project[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  const fetchProjects = async (page: number, limit: number, search: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/projects?page=${page}&limit=${limit}&search=${search}`
      );
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearchLoading(true);
    }
    fetchProjects(pagination.page, pagination.limit, debouncedSearch)
      .catch(console.error)
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch, pagination.page, pagination.limit, search]);

  const handlePageChange = async (newPage: number) => {
    setPaginationLoading(true);
    try {
      await fetchProjects(newPage, pagination.limit, debouncedSearch);
    } finally {
      setPaginationLoading(false);
    }
  };

  const handleToggleDelete = async (projectId: string, isDeleted: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${projectId}/delete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDeleted }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el estado del usuario");
      }

      fetchProjects(pagination.page, pagination.limit, search);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el estado del proyecto';
      console.error("Error al actualizar el estado del proyecto:", errorMessage);
      alert(errorMessage);
    }
  };

  const columns = defaultColumns(handleToggleDelete);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
      sorting,
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({
              pageIndex: pagination.page - 1,
              pageSize: pagination.limit,
            })
          : updater;
      setPagination((prev) => ({
        ...prev,
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      }));
    },
    onSortingChange: setSorting,
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="relative max-w-sm">
          <Input
            placeholder="Buscar por nombre..."
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
            Crear proyecto
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
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
}