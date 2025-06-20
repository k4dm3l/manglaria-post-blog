"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserFormProps {
  onSuccess: () => void;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImg?: string;
  } | undefined;
}

export function UserForm({ onSuccess, user }: UserFormProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "editor");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [profileImg] = useState(user?.profileImg || "");
  const [newProfileImg, setNewProfileImg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!user;

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
            setNewProfileImg(data.url);
            setError("");
          } else {
            setError("Error al subir la imagen");
          }
        } catch (error) {
          setError("Error al subir la imagen");
          console.error(error);
        }
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isEditMode && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    try {
      const finalProfileImg = newProfileImg ? newProfileImg : profileImg;
      const userData = isEditMode
        ? {
            ...(name !== user?.name && { name }),
            ...(password && { password }),
            ...(role !== user?.role && { role }),
            ...(finalProfileImg !== user?.profileImg && { profileImg: finalProfileImg }),
          }
        : { name, email, password, role, profileImg: finalProfileImg };

      const response = await fetch(
        isEditMode ? `/api/users/${user?._id}` : "/api/users",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <label className="relative group cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="avatar-upload"
          />
          <Avatar className="h-32 w-32 transition-opacity group-hover:opacity-80">
            <AvatarImage src={newProfileImg || profileImg} />
            <AvatarFallback className="text-4xl bg-muted">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Overlay en hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
            <span className="text-white font-medium text-center text-sm">
              Cambiar imagen
            </span>
          </div>
        </label>
      </div>
      <div>
        <Label>Nombre</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isEditMode}
          required
        />
      </div>
      <div>
        <Label>Rol</Label>
        <Select value={role} onValueChange={(value) => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Contraseña</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditMode}
        />
      </div>
      {!isEditMode && (
        <div>
          <Label>Confirmar contraseña</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Procesando..." : isEditMode ? "Actualizar usuario" : "Crear usuario"}
      </Button>
    </form>
  );
}