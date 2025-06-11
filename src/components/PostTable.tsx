import { useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface Post {
  _id: string;
  title: string;
  description: string;
  author: {
    name: string;
    profileImg: string | null;
  };
  image: string;
  isDeleted: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface PostTableProps {
  posts: Post[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function PostTable({ posts, onDelete, onEdit }: PostTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      id: "title",
      header: "Título",
      cell: ({ row }: { row: { original: Post } }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      id: "author",
      header: "Autor",
      cell: ({ row }: { row: { original: Post } }) => {
        const author = row.original.author;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={author?.profileImg || ""} />
              <AvatarFallback className="bg-muted">
                {author?.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span>{author?.name || "Autor desconocido"}</span>
          </div>
        );
      },
    },
    {
      id: "createdAt",
      header: "Fecha de creación",
      cell: ({ row }: { row: { original: Post } }) => (
        <div>
          {format(new Date(row.original.createdAt), "PPP", { locale: es })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: { row: { original: Post } }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original._id)}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(row.original._id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => router.push("/posts/new")}>
          Crear nuevo post
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post._id}>
                {columns.map((column) => (
                  <TableCell key={`${post._id}-${column.id}`}>
                    {column.cell({ row: { original: post } })}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 