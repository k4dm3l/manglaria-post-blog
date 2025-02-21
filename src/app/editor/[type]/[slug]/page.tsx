"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MDEditor from "@uiw/react-md-editor";
import { getPostContent, updateMarkdownFile } from "@/app/actions";
import { usePreventLeave } from "@/hooks/usePreventLeave";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EditPostPage({
  params
}: {
  params: { type: string; slug: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [sha, setSha] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar contenido inicial
  useEffect(() => {
    const loadPost = async () => {
      try {
        const post = await getPostContent(
          `src/content/${params.type}/${params.slug}.md`
        );
        
        if (!post) {
          setError("Post no encontrado");
          return;
        }

        setTitle(post.title);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setSha(post.sha);
      } catch (err) {
        setError("Error cargando el post");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPost();
  }, [params]);

  // Detectar cambios en la ruta
  useEffect(() => {
    const handleRouteChange = (newPath: string) => {
      if (hasChanges && newPath !== pathname && !window.confirm("¿Seguro que quieres salir? Tienes cambios sin guardar.")) {
        router.push(pathname); // Cancelar la navegación
        return false;
      }
      return true;
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === "A" && !handleRouteChange(target.href)) {
        e.preventDefault();
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [hasChanges, pathname, router]);

  // Prevenir cierre de la pestaña
  usePreventLeave(hasChanges);

  // Guardar cambios
  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const fullContent = `---
title: ${title}
excerpt: ${excerpt}
---

${content}`;

      const result = await updateMarkdownFile(
        `src/content/${params.type}/${params.slug}.md`,
        fullContent,
        sha
      );

      if (result.error) throw new Error(result.error);

      setHasChanges(false);
      router.push("/editor");
    } catch (err) {
      setError("Error al guardar los cambios");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en los campos
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement> | string) => {
      setHasChanges(true);
      setter(typeof e === "string" ? e : e.target.value);
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
    <div className="container mx-auto p-4 space-y-6">
      {/* Título */}
      <div className="space-y-2">
        <Label>Título</Label>
        <Input
          value={title}
          onChange={handleChange(setTitle)}
          disabled={isLoading}
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Input
          value={excerpt}
          onChange={handleChange(setExcerpt)}
          disabled={isLoading}
        />
      </div>

      {/* Contenido */}
      <div className="space-y-2">
        <Label>Contenido</Label>
        <MDEditor
          value={content}
          onChange={(val = "") => handleChange(setContent)(val)}
          height={500}
          preview="edit"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={isLoading || !hasChanges}>
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>

      {/* Diálogo de Confirmación */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Seguro que quieres salir?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. Si sales ahora, perderás estos cambios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/editor")}>
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}