import { NextResponse } from "next/server";
import BlogPost from "@/models/BlogPost";
import connect from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  try {
    const blogPost = await BlogPost.findById(id).exec();

    if (!blogPost) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el blog" }, { status: 500 });
  }
}