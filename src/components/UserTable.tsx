// src/components/users-table.tsx
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
import { columns as defaultColumns, User } from "./UsersTableColumns";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Estado para el modal de confirmación
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null); // Estado para el ID del usuario a eliminar

  const fetchUsers = async (page: number, limit: number, search: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users?page=${page}&limit=${limit}&search=${search}&excludeUserId=${session?.user?.id}`
      );
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, pagination.limit, search);
  }, [pagination.page, pagination.limit, search, session?.user?.id]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUserToDeleteId(userId); // Establecer el ID del usuario a eliminar
    setIsDeleteModalOpen(true); // Abrir el modal de confirmación
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

      // Recargar la tabla después de eliminar
      fetchUsers(pagination.page, pagination.limit, search);
    } catch (error: any) {
      console.error("Error al eliminar el usuario:", error.message);
      alert(error.message); // Mostrar mensaje de error
    } finally {
      setIsDeleteModalOpen(false); // Cerrar el modal de confirmación
      setUserToDeleteId(null); // Limpiar el ID del usuario a eliminar
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

      // Recargar la tabla después de actualizar
      fetchUsers(pagination.page, pagination.limit, search);
    } catch (error: any) {
      console.error("Error al actualizar el estado del usuario:", error.message);
      alert(error.message); // Mostrar mensaje de error
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(pagination.page, pagination.limit, search);
  };

  // Pasar handleToggleActive a las columnas
  const columns = defaultColumns(handleEdit, handleDelete, handleToggleActive);

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
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        {session?.user.role === 'admin' && (
          <Button onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}>
            Crear usuario
          </Button>
        )}
      </div>
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
            {table.getRowModel().rows?.length ? (
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
                  {loading ? "Cargando..." : "No se encontraron resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
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