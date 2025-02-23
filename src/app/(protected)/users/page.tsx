"use client";

import { UsersTable } from "@/components/UserTable";

export default function UsersPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      <UsersTable /> {/* Usa el componente UsersTable aquí */}
    </div>
  );
}