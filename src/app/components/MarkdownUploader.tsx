"use client";

import { useState } from "react";
import { uploadMarkdown, mergeDevelopToMaster } from "@/app/actions";
import MDEditor, { commands } from "@uiw/react-md-editor";

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

    const fileName = `${timestamp}_${formattedTitle}.md`;

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
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">Editor</h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Tipo de contenido</label>
          <select
            className="p-2 border rounded w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="blog">Entrada de Blog</option>
            <option value="projects">Proyecto</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Ej: 🌍 El Cambio Climático y su Impacto"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded w-full h-24"
            placeholder="Descripción breve para el excerpt..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Contenido</label>
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
            className="rounded-lg overflow-hidden"
          />
          {contentError && <p className="text-red-500 text-sm">{contentError}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Subir a develop
        </button>
      </form>

      <button
        onClick={handleMerge}
        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Merge a master
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}