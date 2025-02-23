"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormProps {
  onSuccess: () => void;
  user?: { _id: string; name: string; email: string; role: string };
}

export function UserForm({ onSuccess, user }: UserFormProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "editor");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isEditMode = !!user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const url = isEditMode ? `/api/users/${user._id}` : "/api/users/create";
      const method = isEditMode ? "PUT" : "POST";
      const body = isEditMode
        ? JSON.stringify({ name, password, role })
        : JSON.stringify({ name, email, password, role });

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar la solicitud");
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message || "Error al procesar la solicitud. Inténtalo de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <Button type="submit">{isEditMode ? "Actualizar usuario" : "Crear usuario"}</Button>
    </form>
  );
}