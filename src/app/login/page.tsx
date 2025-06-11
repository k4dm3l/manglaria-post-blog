"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingPage } from "@/components/ui/loading";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(searchParams.get("from") || "/dashboard");
    }
  }, [status, router, searchParams]);

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

      if (!result?.ok) {
        throw new Error(result?.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError("Credenciales inválidas. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <LoadingPage />;
  }

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
              <Label htmlFor="email">Usuario</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                placeholder="correo@ejemplo.com"
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

// Componente principal de la página
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <LoginForm />
    </Suspense>
  );
}