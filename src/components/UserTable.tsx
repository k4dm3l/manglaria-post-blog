import { useState, useEffect, useCallback } from "react";
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
import { columns as defaultColumns, User } from "./UsersTableColumns";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { LoadingTable, LoadingSearch, LoadingOverlay } from "./ui/loading";
import { useDebounce } from "@/lib/hooks";

export function UsersTable() {
  const { data: session } = useSession();
  const [data, setData] = useState<User[]>([]);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page: number, limit: number, search: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users?page=${page}&limit=${limit}&search=${search}&excludeUserId=${session?.user?.id}`
      );
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      setData(result.data || []);
      setPagination({
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      setData([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!pagination) return;
    
    if (debouncedSearch !== search) {
      setSearchLoading(true);
    }
    fetchUsers(pagination.page, pagination.limit, debouncedSearch)
      .catch(console.error)
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch, pagination.page, pagination.limit, fetchUsers]);

  const handlePageChange = async (newPage: number) => {
    setPaginationLoading(true);
    try {
      await fetchUsers(newPage, pagination.limit, debouncedSearch);
    } finally {
      setPaginationLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUserToDeleteId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDeleteId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${userToDeleteId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el usuario");
      }

      fetchUsers(pagination.page, pagination.limit, debouncedSearch);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el usuario';
      console.error("Error al eliminar el usuario:", errorMessage);
      alert(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDeleteId(null);
    }
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${userId}/active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el estado del usuario");
      }

      fetchUsers(pagination.page, pagination.limit, debouncedSearch);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el estado del usuario';
      console.error("Error al actualizar el estado del usuario:", errorMessage);
      alert(errorMessage);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(pagination.page, pagination.limit, debouncedSearch);
  };

  const columns = defaultColumns(handleEdit, handleDelete, handleToggleActive);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages || 1,
    state: {
      pagination: {
        pageIndex: (pagination?.page || 1) - 1,
        pageSize: pagination?.limit || 10,
      },
      sorting,
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({
              pageIndex: pagination?.page ? pagination.page - 1 : 0,
              pageSize: pagination?.limit || 10,
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

  if (!table) return null;

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
          <Button onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}>
            Crear usuario
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
              ) : table.getRowModel()?.rows?.length ? (
                table.getRowModel()?.rows.map((row) => (
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

      {/* Modal para crear/editar usuario */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar usuario" : "Crear nuevo usuario"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            onSuccess={handleSuccess}
            user={editingUser || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar usuario */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro de eliminar este usuario?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}