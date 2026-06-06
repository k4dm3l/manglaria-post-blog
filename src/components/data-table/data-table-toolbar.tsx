"use client";

import { Input } from "@/components/ui/input";
import { LoadingSearch } from "@/components/ui/loading";
import { UI_COPY } from "@/constants/ui";

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchLoading?: boolean;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchLoading = false,
  searchPlaceholder = "Buscar...",
  actions,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="relative max-w-sm w-full">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pr-8"
          aria-label={UI_COPY.actions.search}
        />
        {searchLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <LoadingSearch />
          </div>
        )}
      </div>
      {actions}
    </div>
  );
}
