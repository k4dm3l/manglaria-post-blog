// src/app/api/projects/[slug]/route.ts
import { NextResponse } from "next/server";
import Project from "@/models/Project";
import connect from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connect();

  try {
    const project = await Project.findById(params.id).exec();

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el proyecto" }, { status: 500 });
  }
}