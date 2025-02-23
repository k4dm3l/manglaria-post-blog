// src/app/(protected)/editor/page.tsx
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import MarkdownUploader from "../../components/MarkdownUploader";

export default async function EditorPage() {
  const session = await auth();

  if (!session?.user) {
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