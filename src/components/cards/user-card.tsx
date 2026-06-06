"use client";

import { useSession } from "next-auth/react";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UI_COPY } from "@/constants/ui";
import { User } from "@/components/UsersTableColumns";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onToggleActive: (userId: string, active: boolean) => void;
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  onToggleActive,
}: UserCardProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-semibold leading-tight truncate">{user.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>

        {isAdmin && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label="Abrir menú de acciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[100]">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => onEdit(user)}
              >
                {UI_COPY.actions.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onSelect={() => onDelete(user._id)}
                disabled={user.role === "admin"}
              >
                {UI_COPY.actions.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <Switch
              id={`active-${user._id}`}
              checked={user.active}
              onCheckedChange={(checked) => onToggleActive(user._id, checked)}
              aria-label={`Estado de ${user.name}`}
            />
            <Label htmlFor={`active-${user._id}`} className="text-sm">
              Activo
            </Label>
          </div>
        ) : (
          <Badge variant={user.active ? "default" : "destructive"}>
            {user.active ? "Activo" : "Inactivo"}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
