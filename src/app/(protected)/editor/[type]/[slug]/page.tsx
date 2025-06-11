"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import MarkdownUploader from "@/components/MarkdownUploader";
import { LoadingPage } from "@/components/ui/loading";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [initialData, setInitialData] = useState<{
    _id?: string;
    title?: string;
    description?: string;
    content?: string;
    image?: string;
    slug?: string;
  } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const type = params.type === "blogs" || params.type === "projects" ? params.type : undefined;

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!type || !params.slug) {
          throw new Error("Tipo o slug no válido");
        }

        const response = await fetch(`/api/${type}/${params.slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar los datos");
        }

        const blogData = params.type === "projects" ? data : data.data;
        
        setInitialData({
          _id: blogData._id,
          title: blogData.title,
          description: blogData.excerpt || blogData.description,
          content: blogData.content,
          image: blogData.image,
          slug: blogData.slug
        });
      } catch (err) {
        setError("Error cargando los datos");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [type, params.slug]);

  const handleSave = async (data: {
    type: "blogs" | "projects";
    title: string;
    description: string;
    content: string;
    image: string;
    author: string;
    slug: string;
    published: boolean;
    scheduledFor: Date | undefined;
  }) => {
    try {
      if (!type || !params.slug) {
        throw new Error("Tipo o slug no válido");
      }

      const response = await fetch(`/api/${type}/${params.slug}`, {
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
    return <LoadingPage />;
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
          type={type}
          initialData={initialData}
          onSave={handleSave}
        />
      )}
    </div>
  );
}