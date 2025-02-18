"use client";

import { useState } from "react";
import { uploadMarkdown, mergeDevelopToMaster } from "@/app/actions";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function MarkdownUploader() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("blog");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState("");

  const getCurrentTimestamp = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const validateContent = () => {
    const isValid = content.trim().length > 100;
    setContentError(isValid ? "" : "El contenido debe tener al menos 100 caracteres");
    return isValid;
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

    const timestamp = getCurrentTimestamp();
    const timestampName = Date.now();
    
    // Crear contenido con formato específico
    const fullContent = `---
title: ${title}
author: Corporación Manglaria
excerpt: ${description}
timestamp: ${timestamp}
---

${content}`;

    const formData = new FormData();
    
    // Formatear nombre de archivo
    const formattedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const fileName = `${timestampName}_${formattedTitle}.md`;

    const markdownFile = new File([fullContent], fileName, {
      type: "text/markdown",
    });

    formData.append("type", type);
    formData.append("title", title);
    formData.append("file", markdownFile);

    const response = await uploadMarkdown(formData);
    setMessage(response.success || response.error || "Operación realizada sin mensaje.");
  };

  const handleMerge = async () => {
    const response = await mergeDevelopToMaster();
    setMessage(response.success || response.error || "Operación realizada sin mensaje.");
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Editor de Contenido</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-3">
            <Label>Tipo de contenido</Label>
            <Select value={type} onValueChange={setType}>
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
              placeholder="Descripción breve para el excerpt..."
              className="min-h-[100px]"
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

          <div className="flex gap-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Subir a develop
            </Button>
            
            <Button
              type="button"
              onClick={handleMerge}
              className="bg-destructive hover:bg-destructive/90"
            >
              Merge a master
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