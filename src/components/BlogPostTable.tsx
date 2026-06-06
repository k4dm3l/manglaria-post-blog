"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/constants/ui";
import { BlogPost } from "./BlogPostTableColumns";
import { useSession } from "next-auth/react";
import { ErrorBoundary } from "./error-boundary";
import { DataCardGrid } from "./data-table/data-card-grid";
import { DataTableToolbar } from "./data-table/data-table-toolbar";
import { useDataTable } from "./data-table/use-data-table";
import { PaginationResult } from "@/lib/pagination";
import { ContentItemCard } from "./cards/content-item-card";

function parseBlogResponse(result: unknown): {
  items: BlogPost[];
  pagination: PaginationResult<BlogPost>;
} {
  const data = (result as { data: { items: BlogPost[]; total: number; page: number; limit: number; totalPages: number } }).data;
  const items = data.items;
  return {
    items,
    pagination: {
      items,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
      hasNextPage: data.page < data.totalPages,
      hasPreviousPage: data.page > 1,
    },
  };
}

export function BlogPostTable() {
  const { data: session } = useSession();
  const router = useRouter();

  const parseResponse = useCallback(parseBlogResponse, []);

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
  } = useDataTable<BlogPost>({
    fetchUrl: "/api/blogs",
    parseResponse,
  });

  const handleToggleDelete = async (blogPostId: string, isDeleted: boolean) => {
    try {
      const response = await fetch(`/api/blogs/${blogPostId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDeleted }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar el estado del blog post"
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

  return (
    <ErrorBoundary>
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchLoading={searchLoading}
        searchPlaceholder="Buscar por título..."
        actions={
          session?.user.role === "admin" ? (
            <Button onClick={() => router.push("/editor")}>
              Crear blog post
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
          <ContentItemCard
            item={item}
            contentType="blogs"
            onToggleVisibility={handleToggleDelete}
          />
        )}
      />
    </ErrorBoundary>
  );
}
