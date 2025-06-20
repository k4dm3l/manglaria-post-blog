import Project from "@/models/Project";
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Model } from "mongoose";
import { IProject } from "@/models/Project";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();

  try {
    const { isDeleted } = await req.json();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    const ProjectModel = Project as Model<IProject>;
    const project = await ProjectModel.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    project.isDeleted = isDeleted;
    await project.save();

    return NextResponse.json({ message: "Estado actualizado exitosamente", project });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    return NextResponse.json({ error: "Error al actualizar el estado del usuario" }, { status: 500 });
  }
}