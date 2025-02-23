"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import MarkdownUploader from "@/components/MarkdownUploader";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [initialData, setInitialData] = useState<{
    _id?: string;
    title?: string;
    description?: string;
    content?: string;
    image?: string;
  } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Verificar que el tipo sea "blog" o "projects"
  const type = params.type === "blogs" || params.type === "projects" ? params.type : undefined;

  // Cargar información del proyecto o blog post
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!type || !params.slug) {
          throw new Error("Tipo o slug no válido");
        }

        const response = await fetch(`/api/${type}/${params.slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar los datos");
        }

        setInitialData(data);
      } catch (err) {
        setError("Error cargando los datos");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [type, params.slug]);

  // Función para manejar el guardado de cambios
  const handleSave = async (data: {
    type: "blogs" | "projects";
    title: string;
    description: string;
    content: string;
    image: string;
    author: string;
  }) => {
    try {
      if (!type || !params.slug) {
        throw new Error("Tipo o slug no válido");
      }

      const response = await fetch(`/api/${type}/${params.slug}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios");
      }

      router.push(`/${type}`);
    } catch (err) {
      setError("Error al guardar los cambios");
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => router.push("/editor")}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h2 className="text-2xl font-bold">Editar Contenido</h2>
      {type && initialData && (
        <MarkdownUploader
          type={type} // Tipo de contenido (blog o projects)
          initialData={initialData} // Datos iniciales para el modo de edición
          onSave={handleSave} // Función para manejar el guardado
        />
      )}
    </div>
  );
}