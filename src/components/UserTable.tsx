"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { User } from "./UsersTableColumns";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { ErrorBoundary } from "./error-boundary";
import { DataCardGrid } from "./data-table/data-card-grid";
import { DataTableToolbar } from "./data-table/data-table-toolbar";
import { UserCard } from "./cards/user-card";
import { useDataTable } from "./data-table/use-data-table";
import { PaginationResult } from "@/lib/pagination";
import { UI_COPY } from "@/constants/ui";
import { useState } from "react";

function parseUsersResponse(result: unknown): {
  items: User[];
  pagination: PaginationResult<User>;
} {
  const response = result as {
    data: User[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };

  return {
    items: response.data || [],
    pagination: {
      items: response.data || [],
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
      hasNextPage: response.pagination.page < response.pagination.totalPages,
      hasPreviousPage: response.pagination.page > 1,
    },
  };
}

export function UsersTable() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

  const parseResponse = useCallback(parseUsersResponse, []);

  const buildQuery = useCallback(
    (page: number, limit: number, search: string) =>
      `/api/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&excludeUserId=${session?.user?.id ?? ""}`,
    [session?.user?.id]
  );

  const {
    data,
    pagination,
    loading,
    searchLoading,
    paginationLoading,
    search,
    setSearch,
    handlePageChange,
    refresh,
  } = useDataTable<User>({
    fetchUrl: "/api/users",
    buildQuery,
    parseResponse,
    enabled: !!session?.user?.id,
  });

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
      const response = await fetch(`/api/users/${userToDeleteId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el usuario");
      }

      toast.success(UI_COPY.success.deleted);
      await refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : UI_COPY.errors.generic;
      toast.error(message);
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDeleteId(null);
    }
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar el estado del usuario"
        );
      }

      toast.success(UI_COPY.success.updated);
      await refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : UI_COPY.errors.generic;
      toast.error(message);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    refresh().catch(console.error);
  };

  return (
    <ErrorBoundary>
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchLoading={searchLoading}
        searchPlaceholder="Buscar por nombre o email..."
        actions={
          session?.user.role === "admin" ? (
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
            >
              Crear usuario
            </Button>
          ) : null
        }
      />
      <DataCardGrid
        items={data}
        loading={loading}
        paginationLoading={paginationLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        getItemKey={(item) => item._id}
        renderCard={(item) => (
          <UserCard
            user={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar usuario" : "Crear nuevo usuario"}
            </DialogTitle>
          </DialogHeader>
          <UserForm onSuccess={handleSuccess} user={editingUser || undefined} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de eliminar este usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{UI_COPY.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {UI_COPY.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  );
}
