import { NextResponse } from "next/server";
import { User } from "@/models/User";
import connect from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Model } from "mongoose";
import { IUser } from "@/models/User";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const userToDelete = await (User as Model<IUser>).findById(id);
    if (!userToDelete) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (userToDelete.role === "admin") {
      return NextResponse.json(
        { error: "No puedes eliminar a otro administrador" },
        { status: 403 }
      );
    }

    await (User as Model<IUser>).findByIdAndDelete(id);
    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}