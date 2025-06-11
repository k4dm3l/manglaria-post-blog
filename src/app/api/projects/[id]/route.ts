import { NextResponse } from "next/server";
import Project, { IProject } from "@/models/Project";
import connect from "@/lib/db";
import { Model } from "mongoose";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  try {
    const ProjectModel = Project as Model<IProject>;
    const project = await ProjectModel.findById(id).exec();

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el proyecto" }, { status: 500 });
  }
}