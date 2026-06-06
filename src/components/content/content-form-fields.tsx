"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";

interface ContentFormFieldsProps {
  type: "blogs" | "projects";
  title: string;
  description: string;
  image: string;
  isLoading?: boolean;
  isEditMode?: boolean;
  onTypeChange: (value: "blogs" | "projects") => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageUploaded: (url: string) => void;
}

export function ContentFormFields({
  type,
  title,
  description,
  image,
  isLoading = false,
  isEditMode = false,
  onTypeChange,
  onTitleChange,
  onDescriptionChange,
  onImageUploaded,
}: ContentFormFieldsProps) {
  return (
    <>
      <div className="space-y-3">
        <Label htmlFor="content-type">Tipo de contenido</Label>
        <Select
          value={type}
          onValueChange={(value) => onTypeChange(value as "blogs" | "projects")}
          disabled={isEditMode || isLoading}
        >
          <SelectTrigger id="content-type" className="w-[220px]">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blogs">Entrada de Blog</SelectItem>
            <SelectItem value="projects">Proyecto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ej: El Cambio Climático y su Impacto"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descripción breve..."
          className="min-h-[100px]"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <Label>Imagen</Label>
        <ImageUploader
          onImageUploaded={onImageUploaded}
          initialImage={image}
          folder={type}
        />
      </div>
    </>
  );
}
