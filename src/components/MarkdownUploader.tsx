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
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUploader from "./ImageUploader";
import { Loading } from "./ui/loading";

type MarkdownUploaderProps = {
  type?: "blogs" | "projects";
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    content?: string;
    image?: string;
    slug?: string;
    published?: boolean;
    scheduledFor?: Date;
  };
  onSave?: (data: {
    type: "blogs" | "projects";
    title: string;
    description: string;
    content: string;
    image: string;
    author: string;
    slug: string;
    published: boolean;
    scheduledFor: Date | undefined;
  }) => Promise<void>;
};

export default function MarkdownUploader({
  type: initialType = "blogs",
  initialData,
  onSave,
}: MarkdownUploaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [contentError, setContentError] = useState("");
  const [image, setImage] = useState(initialData?.image || "");
  const [newImage, setNewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(initialData?.published || false);
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(
    initialData?.scheduledFor ? new Date(initialData.scheduledFor) : undefined
  );

  const validateContent = () => {
    const isValid = content.trim().length > 100;
    setContentError(isValid ? "" : "El contenido debe tener al menos 100 caracteres");
    return isValid;
  };

  // const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onloadend = async () => {
  //       const base64data = reader.result as string;
  //       try {
  //         const response = await fetch('/api/upload-image', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({ data: base64data }),
  //         });

  //         if (response.ok) {
  //           const data = await response.json();
  //           setNewImage(data.url);
  //         } else {
  //           setMessage('Error al subir la imagen');
  //         }
  //       } catch (error) {
  //         setMessage('Error al subir la imagen');
  //         console.error(error);
  //       }
  //     };
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!title.trim()) {
      setMessage("El título es obligatorio");
      setIsLoading(false);
      return;
    }

    if (!description.trim()) {
      setMessage("La descripción es obligatoria");
      setIsLoading(false);
      return;
    }

    if (!validateContent()) {
      setIsLoading(false);
      return;
    }

    const finalImage = newImage || image;

    if (!finalImage) {
      setMessage("Debes subir una imagen");
      setIsLoading(false);
      return;
    }

    const slug = generateSlug(title);

    try {
      const data = {
        type,
        title,
        description,
        content,
        image: finalImage,
        author: session?.user?.id || "",
        slug,
        published,
        scheduledFor,
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
          setPublished(false);
          setScheduledFor(undefined);
        } else {
          setMessage(result.error || "Error al guardar el contenido");
        }
      }

      if (type === "projects") {
        router.push(`/projects`);
      } else {
        router.push(`/blogs`);
      }
    } catch (err) {
      console.error("Error saving content:", err);
      setError("Error saving content. Please try again.");
    } finally {
      setIsLoading(false);
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label>Imagen</Label>
            <ImageUploader
              onImageUploaded={(url, _) => {
                setNewImage(url);
              }}
              initialImage={image}
              folder={type}
            />
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

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
              disabled={isLoading || !!scheduledFor}
            />
            <Label htmlFor="published">Publicar inmediatamente</Label>
          </div>

          {!published && (
            <div className="space-y-2">
              <Label>Programar para más tarde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledFor && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledFor ? (
                      format(scheduledFor, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledFor}
                    onSelect={setScheduledFor}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>

        {message && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/50">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}