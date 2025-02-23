// src/app/api/users/[id]/active/route.ts
import { NextResponse } from "next/server";
import User from "@/models/User";
import connect from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connect();

  try {
    // Obtener el cuerpo de la solicitud
    const { active } = await req.json();

    // Verificar si el ID del usuario es válido
    if (!params.id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Actualizar el estado active
    user.active = active;
    await user.save();

    return NextResponse.json({ message: "Estado actualizado exitosamente", user });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    return NextResponse.json({ error: "Error al actualizar el estado del usuario" }, { status: 500 });
  }
}