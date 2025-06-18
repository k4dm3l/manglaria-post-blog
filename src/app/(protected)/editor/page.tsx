"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import MarkdownUploader from "@/components/MarkdownUploader";
import { LoadingPage } from "@/components/ui/loading";

export default function EditorPage() {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "unauthenticated") {
    redirect("/login?error=Unauthorized");
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Crear Nuevo Contenido</h2>
        <MarkdownUploader />
      </div>
    </div>
  );
}