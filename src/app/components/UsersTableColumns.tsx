// src/components/users-table-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch"; // Importar el componente Switch
import { Badge } from "@/components/ui/badge"

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean; // Agregar el campo active
};

export const columns = (
  handleEdit: (user: User) => void,
  handleDelete: (userId: string) => void,
  handleToggleActive: (userId: string, active: boolean) => void // Función para manejar el toggle
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
  },
  {
    accessorKey: "active",
    header: "Estado",
    cell: ({ row }) => {
      const { data: session } = useSession(); // Obtener la sesión del usuario actual
      const user = row.original;

      // Mostrar el toggle solo si el usuario actual es admin
      if (session?.user?.role === "admin") {
        return (
          <Switch
            checked={user.active}
            onCheckedChange={(checked) => handleToggleActive(user._id, checked)}
          />
        );
      }

      // Si no es admin, mostrar un texto con el estado
      return (
        <Badge variant={user.active ? "default" : "destructive"}>
          {user.active ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { data: session } = useSession();
      const user = row.original;

      if (session?.user?.role !== "admin") {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user._id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(user)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(user._id)}
              disabled={user.role === "admin"}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];