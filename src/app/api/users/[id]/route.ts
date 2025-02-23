import { NextResponse } from "next/server";
import User from "@/models/User";
import connect from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  try {
    if (!id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    const { name, password, role } = await req.json();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    user.name = name;
    user.role = role;

    if (password) {
      user.password = password;
    }

    await user.save();
    return NextResponse.json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 });
  }
}