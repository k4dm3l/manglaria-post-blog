"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateSlug } from "@/lib/utils";

type MarkdownUploaderProps = {
  type?: "blogs" | "projects";
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    content?: string;
    image?: string;
    slug?: string;
  };
  onSave?: (data: {
    type: "blogs" | "projects";
    title: string;
    description: string;
    content: string;
    image: string;
    author: string;
    slug: string;
  }) => Promise<void>;
};

export default function MarkdownUploader({
  type: initialType = "blogs",
  initialData,
  onSave,
}: MarkdownUploaderProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [contentError, setContentError] = useState("");
  const [image, setImage] = useState(initialData?.image || "");
  const [newImage, setNewImage] = useState("");

  const validateContent = () => {
    const isValid = content.trim().length > 100;
    setContentError(isValid ? "" : "El contenido debe tener al menos 100 caracteres");
    return isValid;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: base64data }),
          });

          if (response.ok) {
            const data = await response.json();
            setNewImage(data.url);
          } else {
            setMessage('Error al subir la imagen');
          }
        } catch (error) {
          setMessage('Error al subir la imagen');
          console.error(error);
        }
      };
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("El título es obligatorio");
      return;
    }

    if (!description.trim()) {
      setMessage("La descripción es obligatoria");
      return;
    }

    if (!validateContent()) return;

    const finalImage = newImage || image;

    if (!finalImage) {
      setMessage("Debes subir una imagen");
      return;
    }

    const slug: string = generateSlug(title);

    try {
      const data = {
        type,
        title,
        description,
        content,
        image: finalImage,
        author: session?.user?.id || "",
        slug,
      };

      if (onSave) {
        await onSave(data);
      } else {
        const response = await fetch("/api/save-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          setMessage("Contenido guardado exitosamente");
          setTitle("");
          setDescription("");
          setContent("");
          setImage("");
          setNewImage("");
        } else {
          setMessage(result.error || "Error al guardar el contenido");
        }
      }
    } catch (error) {
      setMessage("Error al guardar el contenido");
      console.error(error);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialData ? "Editar Contenido" : "Crear Nuevo Contenido"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-3">
            <Label>Tipo de contenido</Label>
            <Select
              value={type}
              onValueChange={(value: string) => setType(value as "blogs" | "projects")}
              disabled={!!initialData}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Entrada de Blog</SelectItem>
                <SelectItem value="projects">Proyecto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 🌍 El Cambio Climático y su Impacto"
            />
          </div>

          <div className="space-y-3">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <Label>Imagen</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {(newImage || image) && (
              <img
                src={newImage || image}
                alt="Preview"
                className="mt-2 rounded-lg"
                style={{ maxWidth: '100%' }}
              />
            )}
          </div>

          <div className="space-y-3">
            <Label>Contenido</Label>
            <div className="overflow-hidden rounded-lg border">
              <MDEditor
                value={content}
                onChange={(value = "") => setContent(value)}
                height={400}
                preview="live"
                extraCommands={[
                  commands.codePreview,
                  commands.fullscreen,
                  commands.title1,
                ]}
              />
            </div>
            {contentError && <p className="text-sm text-destructive mt-2">{contentError}</p>}
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {initialData ? "Guardar Cambios" : "Guardar contenido"}
            </Button>
          </div>
        </form>

        {message && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}