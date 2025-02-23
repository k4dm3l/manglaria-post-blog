// src/app/api/users/[id]/active/route.ts
import BlogPost from "@/models/BlogPost";
import { NextResponse } from "next/server";
import connect from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connect();

  try {
    // Obtener el cuerpo de la solicitud
    const { isDeleted } = await req.json();

    // Verificar si el ID del usuario es válido
    if (!params.id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    // Buscar el usuario en la base de datos
    const blogPost = await BlogPost.findById(params.id);
    if (!blogPost) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Actualizar el estado active
    blogPost.isDeleted = isDeleted;
    await blogPost.save();

    return NextResponse.json({ message: "Estado actualizado exitosamente", blogPost });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    return NextResponse.json({ error: "Error al actualizar el estado del usuario" }, { status: 500 });
  }
}