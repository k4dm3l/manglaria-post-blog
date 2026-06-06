"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { generateSlug } from "@/lib/utils";
import { Loading } from "./ui/loading";
import { ContentFormFields } from "./content/content-form-fields";
import { PublishControls } from "./content/publish-controls";
import { UI_COPY } from "@/constants/ui";

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
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [contentError, setContentError] = useState("");
  const [image, setImage] = useState(initialData?.image || "");
  const [newImage, setNewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState(initialData?.published || false);
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(
    initialData?.scheduledFor ? new Date(initialData.scheduledFor) : undefined
  );

  const validateContent = () => {
    const isValid = content.trim().length >= 100;
    setContentError(
      isValid ? "" : "El contenido debe tener al menos 100 caracteres"
    );
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title.trim()) {
      toast.error("El título es obligatorio");
      setIsLoading(false);
      return;
    }

    if (!description.trim()) {
      toast.error("La descripción es obligatoria");
      setIsLoading(false);
      return;
    }

    if (!validateContent()) {
      setIsLoading(false);
      return;
    }

    const finalImage = newImage || image;

    if (!finalImage) {
      toast.error("Debes subir una imagen");
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

        if (!response.ok) {
          throw new Error(result.error || "Error al guardar el contenido");
        }

        toast.success(UI_COPY.success.saved);
        setTitle("");
        setDescription("");
        setContent("");
        setImage("");
        setNewImage("");
        setPublished(false);
        setScheduledFor(undefined);
      }

      router.push(type === "projects" ? "/projects" : "/blogs");
    } catch (err) {
      console.error("Error saving content:", err);
      toast.error(
        err instanceof Error ? err.message : UI_COPY.errors.generic
      );
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
          <ContentFormFields
            type={type}
            title={title}
            description={description}
            image={image}
            isLoading={isLoading}
            isEditMode={!!initialData}
            onTypeChange={setType}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onImageUploaded={setNewImage}
          />

          <div className="space-y-3">
            <Label htmlFor="content">Contenido</Label>
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
            {contentError && (
              <p className="text-sm text-destructive mt-2" role="alert">
                {contentError}
              </p>
            )}
          </div>

          <PublishControls
            published={published}
            scheduledFor={scheduledFor}
            isLoading={isLoading}
            onPublishedChange={setPublished}
            onScheduledForChange={setScheduledFor}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              {UI_COPY.actions.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                UI_COPY.actions.save
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
