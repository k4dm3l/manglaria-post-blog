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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge"

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

// Active status cell component
const ActiveStatusCell = ({ user, handleToggleActive }: { user: User; handleToggleActive: (userId: string, active: boolean) => void }) => {
  const { data: session } = useSession();

  if (session?.user?.role === "admin") {
    return (
      <Switch
        checked={user.active}
        onCheckedChange={(checked) => handleToggleActive(user._id, checked)}
      />
    );
  }

  return (
    <Badge variant={user.active ? "default" : "destructive"}>
      {user.active ? "Activo" : "Inactivo"}
    </Badge>
  );
};

// Actions cell component  
const ActionsCell = ({ user, handleEdit, handleDelete }: { user: User; handleEdit: (user: User) => void; handleDelete: (userId: string) => void }) => {
  const { data: session } = useSession();

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
};

export const columns = (
  handleEdit: (user: User) => void,
  handleDelete: (userId: string) => void,
  handleToggleActive: (userId: string, active: boolean) => void
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
      const user = row.original;
      return <ActiveStatusCell user={user} handleToggleActive={handleToggleActive} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <ActionsCell user={user} handleEdit={handleEdit} handleDelete={handleDelete} />;
    },
  },
];