import { NextRequest, NextResponse } from "next/server";
import BlogPost from "@/models/BlogPost";
import connect from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } } // <-- Parámetros correctos
) {
  await connect();

  try {
    const { isDeleted } = await req.json();

    if (!params?.id) {
      return NextResponse.json(
        { error: "ID de usuario no proporcionado" },
        { status: 400 }
      );
    }

    const blogPost = await BlogPost.findById(params.id);
    if (!blogPost) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    blogPost.isDeleted = isDeleted;
    await blogPost.save();

    return NextResponse.json({
      message: "Estado actualizado exitosamente",
      blogPost,
    });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado del usuario" },
      { status: 500 }
    );
  }
}
