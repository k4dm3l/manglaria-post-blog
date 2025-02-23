"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  // Mostrar un loader mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Redirigir si no está autenticado
  if (status === "unauthenticated") {
    redirect("/login");
  }

  // Renderizar el layout con Navigation
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}