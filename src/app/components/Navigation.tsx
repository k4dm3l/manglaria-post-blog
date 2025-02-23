"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Pen, Feather } from "lucide-react"; // Importar íconos de lucide-react

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };

  // Mostrar un loader mientras se carga la sesión
  if (status === "loading") {
    return null; // O un loader personalizado
  }

  // Solo mostrar en rutas protegidas
  const isProtectedRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/editor") ||
    pathname?.startsWith("/users") ||
    pathname?.startsWith("/blogs") ||
    pathname?.startsWith("/projects");

  if (!session || !isProtectedRoute) return null;

  return (
    <nav className="border-b p-4 flex justify-between items-center bg-background">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-lg font-semibold">
          CMS Manglaria
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{session.user?.email}</span>
        <Avatar>
          <AvatarImage src={session.user.profileImg} alt="@shadcn" />
          <AvatarFallback>{session.user.name?.split('')[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {/* Botón para crear contenido */}
        <Button asChild variant="outline" className="space-x-2">
          <Link href="/editor">
            <Feather className="h-4 w-4" /> {/* Ícono de pluma */}
            <span>Crear contenido</span>
          </Link>
        </Button>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          Cerrar Sesión
        </Button>
      </div>
    </nav>
  );
}