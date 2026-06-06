import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { ErrorBoundary } from "@/components/error-boundary";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ProtectedShell>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ProtectedShell>
  );
}
