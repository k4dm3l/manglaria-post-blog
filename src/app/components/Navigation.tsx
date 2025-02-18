"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: "/login",
    });
    
    // Limpiar parámetros de la URL
    const loginUrl = new URL("/login", window.location.origin);
    loginUrl.searchParams.delete("error");
    
    // Eliminar cookies de sesión
    document.cookie = 'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'next-auth.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Redirección limpia
    window.location.href = loginUrl.toString();
  };

  return (
    <nav className="border-b p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">CMS Manglaria</h1>
      <Button 
        onClick={handleLogout}
        variant="ghost"
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        Cerrar Sesión
      </Button>
    </nav>
  );
}