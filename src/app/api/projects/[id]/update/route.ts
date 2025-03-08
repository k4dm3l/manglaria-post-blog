import { NextResponse } from "next/server";
import Project from "@/models/Project";
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

    const { title, description, content, image } = await req.json();
    const project = await Project.findById(id).exec();

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    project.title = title; 
    project.description = description;
    project.content = content;
    project.image = image;

    await project.save();
    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el proyecto" }, { status: 500 });
  }
}