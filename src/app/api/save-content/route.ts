import { NextResponse } from "next/server";
import Project from "@/models/Project";
import { BlogPost } from "@/models/BlogPost";
import connect from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";

export async function POST(req: Request) {
  try {
    console.log("Environment:", process.env.NODE_ENV);
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

    const session = await getServerSession(authOptions);
    console.log("Session result:", session);
    
    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user ID from the session
    const userId = (session.user as { id: string }).id;
    if (!userId) {
      console.log("No user ID found in session");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }

    console.log("User ID:", userId);

    await connect();

    const { 
      type, 
      title, 
      description, 
      content, 
      image,
      slug,
      published,
      scheduledFor
    } = await req.json();

    console.log("Content type:", type);

    if (type === "blog") {
      const blogPostData = {
        title,
        excerpt: description,
        description,
        content,
        image,
        author: new Types.ObjectId(userId),
        slug,
        type: 'blog',
        status: published ? 'published' : 'draft',
        publishedAt: published ? new Date() : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        published: published || false,
      };
      
      const newBlogPost = new BlogPost(blogPostData);
      const savedPost = await newBlogPost.save();
      
      return NextResponse.json({ 
        success: true,
        data: savedPost,
        message: "Entrada de blog guardada exitosamente" 
      });
    } else if (type === "projects") {
      const newProject = new Project({
        title,
        description,
        content,
        image,
        author: userId,
        slug,
        status: published ? 'published' : 'draft',
        publishedAt: published ? new Date() : null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      });

      const savedProject = await newProject.save();
      return NextResponse.json({ 
        success: true,
        data: savedProject,
        message: "Proyecto guardado exitosamente" 
      });
    } else {
      return NextResponse.json(
        { error: "Tipo de contenido no válido" }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { 
        error: "Error al guardar el contenido",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}