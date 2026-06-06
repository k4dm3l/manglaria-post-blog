"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { Project } from "./ProjectsTableColumns";
import { ErrorBoundary } from "./error-boundary";
import { DataCardGrid } from "./data-table/data-card-grid";
import { DataTableToolbar } from "./data-table/data-table-toolbar";
import { useDataTable } from "./data-table/use-data-table";
import { PaginationResult } from "@/lib/pagination";
import { UI_COPY } from "@/constants/ui";
import { ContentItemCard } from "./cards/content-item-card";

function parseProjectResponse(result: unknown): {
  items: Project[];
  pagination: PaginationResult<Project>;
} {
  const response = result as {
    data: Project[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };

  return {
    items: response.data,
    pagination: {
      items: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
      hasNextPage: response.pagination.page < response.pagination.totalPages,
      hasPreviousPage: response.pagination.page > 1,
    },
  };
}

export function ProjectTable() {
  const parseResponse = useCallback(parseProjectResponse, []);

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
  } = useDataTable<Project>({
    fetchUrl: "/api/projects",
    parseResponse,
  });

  const handleToggleDelete = async (projectId: string, isDeleted: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/delete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDeleted }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar el estado del proyecto"
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
            contentType="projects"
            onToggleVisibility={handleToggleDelete}
          />
        )}
      />
    </ErrorBoundary>
  );
}
