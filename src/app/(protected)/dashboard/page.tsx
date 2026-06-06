"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  FileText,
  PenSquare,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { UI_COPY } from "@/constants/ui";

const quickLinks = [
  {
    title: UI_COPY.nav.blogs,
    description: "Administra entradas del blog",
    href: "/blogs",
    icon: BookOpen,
  },
  {
    title: UI_COPY.nav.projects,
    description: "Gestiona proyectos publicados",
    href: "/projects",
    icon: FileText,
  },
  {
    title: UI_COPY.nav.users,
    description: "Control de acceso y roles",
    href: "/users",
    icon: Users,
  },
  {
    title: UI_COPY.nav.scheduled,
    description: "Contenido programado",
    href: "/scheduled",
    icon: CalendarClock,
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona el contenido de Manglaria desde este panel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Card key={item.href} className="hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <item.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={item.href}>Abrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>
            Crea contenido nuevo o revisa documentos legales.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/editor">
              <PenSquare className="mr-2 h-4 w-4" />
              {UI_COPY.nav.createContent}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/legal-documents">{UI_COPY.nav.legal}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
