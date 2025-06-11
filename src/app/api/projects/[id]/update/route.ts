import { NextResponse } from "next/server";
import Project, { IProject } from "@/models/Project";
import connect from "@/lib/db";
import { Model } from "mongoose";

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

    const { title, description, content, image } = await req.json();
    const ProjectModel = Project as Model<IProject>;
    const project = await ProjectModel.findById(id).exec();

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    (project as IProject).title = title; 
    (project as IProject).description = description;
    (project as IProject).content = content;
    (project as IProject).image = image;

    await project.save();
    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el proyecto" }, { status: 500 });
  }
}