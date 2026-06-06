"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { MoreHorizontal } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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

export interface ContentItem {
  _id: string;
  title: string;
  description: string;
  image?: string;
  author: {
    name: string;
    profileImg: string;
  };
  isDeleted: boolean;
  slug?: string;
}

interface ContentItemCardProps {
  item: ContentItem;
  contentType: "blogs" | "projects";
  onToggleVisibility: (id: string, isDeleted: boolean) => void;
}

export function ContentItemCard({
  item,
  contentType,
  onToggleVisibility,
}: ContentItemCardProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";
  const isPublic = !item.isDeleted;
  const editHref = `/editor/${contentType}/${item.slug ?? item._id}`;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {item.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b bg-muted">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-semibold leading-tight line-clamp-2">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
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
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={editHref}>{UI_COPY.actions.edit}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={item.author.profileImg}
              alt={item.author.name}
            />
            <AvatarFallback>
              {item.author?.name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.author.name}</p>
            <p className="text-xs text-muted-foreground">Autor</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Switch
                id={`feed-${item._id}`}
                checked={isPublic}
                onCheckedChange={(checked) =>
                  onToggleVisibility(item._id, !checked)
                }
                aria-label={`Visibilidad de ${item.title}`}
              />
              <Label htmlFor={`feed-${item._id}`} className="text-sm">
                Feed
              </Label>
            </>
          ) : (
            <Badge variant={isPublic ? "default" : "destructive"}>
              {isPublic ? "Publico" : "Privado"}
            </Badge>
          )}
        </div>

        <Badge variant={isPublic ? "default" : "secondary"}>
          {isPublic ? "Visible" : "Oculto"}
        </Badge>
      </CardFooter>
    </Card>
  );
}
