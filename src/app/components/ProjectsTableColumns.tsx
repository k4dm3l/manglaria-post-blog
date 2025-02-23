// src/components/projects-table-columns.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"
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

export type Project = {
  _id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    profileImg: string;
  };
  isDeleted: boolean;
}

export const columns = (
  handleToggleDelete: (projectId: string, isDeleted: boolean) => void,
): ColumnDef<Project>[] => [
  {
    accessorKey: "title",
    header: () => <div className="text-center">Titulo</div>,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex flex-col items-center justify-center gap-1 h-full">{project.title}</div>
      );
    },
  },
  // {
  //   accessorKey: "description",
  //   header: "Descripcion",
  // },
  {
    accessorKey: "author",
    header: () => <div className="text-center">Autor</div>,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex flex-col items-center justify-center gap-1 h-full"> {/* Apilar elementos verticalmente y centrar */}
          <Avatar>
            <AvatarImage src={project.author.profileImg} alt={project.author.name} />
            <AvatarFallback>
              {project.author.name?.split('')[0].toUpperCase()} {/* Mostrar la primera letra del nombre */}
            </AvatarFallback>
          </Avatar>
          <Badge variant="outline" className="text-xs"> {/* Reducir el tamaño de la letra */}
            {project.author.name}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "isDeleted",
    header: "Feed",
    cell: ({ row }) => {
      const { data: session } = useSession();
      const project = row.original;

      if (session?.user.role === "admin") {
        return (
          <Switch
            checked={!project.isDeleted}
            onCheckedChange={(checked) => handleToggleDelete(project._id, !checked)}
          />
        );
      }

      return (
        <Badge variant={project.isDeleted ? "destructive" : "default"}>
          {project.isDeleted ? "Privado" : "Publico"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { data: session } = useSession();
      const project = row.original;
      const router = useRouter();

      if (session?.user?.role !== "admin") {
        return null;
      }

      const handleEdit = () => {
        // Redirigir a la página de editor con el tipo y el slug del proyecto
        router.push(`/editor/projects/${project._id}`);
      };

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
              onClick={() => navigator.clipboard.writeText(project._id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit} disabled>
              Eliminar (Next Feature)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]