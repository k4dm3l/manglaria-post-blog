import { NextResponse } from "next/server";
import Project from "@/models/Project";
import connect from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  try {
    const project = await Project.findOne({ slug: id }).exec();

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el proyecto" }, { status: 500 });
  }
}