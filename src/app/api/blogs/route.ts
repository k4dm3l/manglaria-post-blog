// src/app/api/users/route.ts
import BlogPost from "@/models/BlogPost";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { headers } from "next/headers";
import { validateToken } from '@/lib/auth';
import connect from "@/lib/db";

export async function GET(request: Request) {
  try {
    await connect();

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    let session = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      session = await validateToken(token);
      
      if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    } else {
      session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    // Obtener parámetros de búsqueda y paginación
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Construir el filtro de búsqueda
    const filter: any = 
      search 
      ? { title: { $regex: search, $options: "i" } } 
      : { };
    
    // Obtener usuarios paginados y filtrados
    const blogPosts = await BlogPost.find(filter)
      .select("-content") // Excluir el campo "content"
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author', // Campo a poblar
        select: 'name profileImg', // Selecciona solo el nombre y la imagen de perfil
      })
      .exec();

    const formattedBlogPost = blogPosts.map((project) => ({
      ...project.toObject(), // Convertir el documento de Mongoose a un objeto plano
      author: {
        name: project.author.name,
        profileImg: project.author.profileImg || null, // Si no hay imagen, devolver null
      },
    }));

    // Obtener el total de usuarios que coinciden con el filtro
    const total = await BlogPost.countDocuments(filter);

    return NextResponse.json({
      data: formattedBlogPost,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No user found" }, { status: 400 });
  }
}