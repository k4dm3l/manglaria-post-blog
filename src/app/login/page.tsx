// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error")) {
      setError("Acceso no autorizado. Inicia sesión nuevamente.");
      router.replace("/login");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: e.currentTarget.email.value,
        password: e.currentTarget.password.value,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Forzar recarga completa del contexto de autenticación
      window.location.href = searchParams.get("from") || "/dashboard";
      
    } catch (err) {
      setError("Credenciales inválidas. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg border shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Acceso al CMS</h1>
          <p className="text-muted-foreground">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="email" // Cambiado de 'username'
                name="email" // Cambiado de 'username'
                type="email" // Nuevo tipo
                required
                disabled={isLoading}
                placeholder="correo@ejemplo.com" // Nuevo placeholder
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Verificando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
}