// src/app/api/users/[id]/route.ts (DELETE)
import { NextResponse } from "next/server";
import User from "@/models/User";
import connect from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connect();

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const userToDelete = await User.findById(params.id);
    if (!userToDelete) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir eliminar a otro admin
    if (userToDelete.role === "admin") {
      return NextResponse.json(
        { error: "No puedes eliminar a otro administrador" },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}