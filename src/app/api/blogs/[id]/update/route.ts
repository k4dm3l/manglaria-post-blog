import { NextResponse } from "next/server";
import BlogPost from "@/models/BlogPost";
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
    const blogPost = await BlogPost.findById(id).exec();

    if (!blogPost) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }

    blogPost.title = title; 
    blogPost.description = description;
    blogPost.content = content;
    blogPost.image = image;

    await blogPost.save();
    return NextResponse.json(blogPost);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener el blog" }, { status: 500 });
  }
}