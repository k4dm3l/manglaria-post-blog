
import { NextResponse } from "next/server";
import User from "@/models/User";
import connect from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  try {
    const { active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    user.active = active;
    await user.save();

    return NextResponse.json({ message: "Estado actualizado exitosamente", user });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    return NextResponse.json({ error: "Error al actualizar el estado del usuario" }, { status: 500 });
  }
}