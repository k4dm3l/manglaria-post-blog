"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/login?error=Unauthorized");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bienvenido {session?.user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/users">
          <Button className="w-full">Gestionar Usuarios</Button>
        </Link>
        <Link href="/blogs">
          <Button className="w-full">Gestionar Blogs</Button>
        </Link>
        <Link href="/projects">
          <Button className="w-full">Gestionar Proyectos</Button>
        </Link>
        <Link href="/legal-documents">
          <Button className="w-full">Gestionar Documentos Legales</Button>
        </Link>
      </div>
    </div>
  );
}