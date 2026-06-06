"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { UI_COPY } from "@/constants/ui";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth";

function getCallbackUrl(searchParams: URLSearchParams): string {
  const callbackUrl =
    searchParams.get("callbackUrl") || searchParams.get("from");

  if (!callbackUrl) {
    return "/dashboard";
  }

  try {
    const url = new URL(callbackUrl, window.location.origin);
    if (url.origin !== window.location.origin) {
      return "/dashboard";
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [authError, setAuthError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (searchParams.get("error")) {
      setAuthError(UI_COPY.errors.unauthorized);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(getCallbackUrl(searchParams));
    }
  }, [status, router, searchParams]);

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError("");

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result?.ok) {
        setAuthError(UI_COPY.errors.invalidCredentials);
        return;
      }

      await getSession();
      router.refresh();
      router.replace(getCallbackUrl(searchParams));
    } catch (err) {
      console.error("Sign in error:", err);
      setAuthError(UI_COPY.errors.invalidCredentials);
    }
  };

  if (status === "loading") {
    return <LoadingPage />;
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Acceso al CMS</h1>
        <p className="text-muted-foreground">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {authError && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {authError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Verificando..." : "Iniciar Sesión"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <LoginForm />
    </Suspense>
  );
}
