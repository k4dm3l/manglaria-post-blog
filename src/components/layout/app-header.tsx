"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTE_LABELS, UI_COPY } from "@/constants/ui";
import { UserNav } from "./user-nav";

const NON_LINKABLE_SEGMENTS = new Set(["editor"]);

const CONTENT_LIST_ROUTES: Record<string, string> = {
  blogs: "/blogs",
  projects: "/projects",
};

function resolveCrumbHref(segments: string[], index: number): string {
  const segment = segments[index];

  if (
    index > 0 &&
    segments[0] === "editor" &&
    segment &&
    CONTENT_LIST_ROUTES[segment]
  ) {
    return CONTENT_LIST_ROUTES[segment];
  }

  return `/${segments.slice(0, index + 1).join("/")}`;
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: UI_COPY.nav.dashboard, href: "/dashboard", linkable: true }];
  }

  return segments.map((segment, index) => {
    const href = resolveCrumbHref(segments, index);
    const label = ROUTE_LABELS[segment] ?? segment;
    const linkable = !NON_LINKABLE_SEGMENTS.has(segment);
    return { label, href, linkable };
  });
}

export function AppHeader() {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const showAsLink = !isLast && crumb.linkable;

            return (
              <Fragment key={`${crumb.href}-${index}`}>
                <BreadcrumbItem>
                  {showAsLink ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <span className="text-muted-foreground">{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
