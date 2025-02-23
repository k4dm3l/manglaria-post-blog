import { NextResponse } from "next/server";
import Project from "@/models/Project";
import BlogPost from "@/models/BlogPost";
import connect from "@/lib/db";

export async function POST(req: Request) {
  await connect();

  try {
    const { type, title, description, content, image, author } = await req.json();

    if (type === "blog") {
      const newBlogPost = new BlogPost({
        title,
        excerpt: description,
        content,
        image,
        author,
      });
      await newBlogPost.save();
      return NextResponse.json({ message: "Entrada de blog guardada exitosamente" });
    } else if (type === "projects") {
      const newProject = new Project({
        title,
        description,
        content,
        image,
        author,
      });
      await newProject.save();
      return NextResponse.json({ message: "Proyecto guardado exitosamente" });
    } else {
      return NextResponse.json({ error: "Tipo de contenido no válido" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al guardar el contenido" }, { status: 500 });
  }
}