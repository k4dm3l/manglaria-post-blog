"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { LoadingPage } from "@/components/ui/loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}