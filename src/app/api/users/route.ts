// src/app/api/users/route.ts
import User from "@/models/User";
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
    const excludeUserId = searchParams.get("excludeUserId") || ""; // Nuevo parámetro para excluir al usuario actual
    const skip = (page - 1) * limit;

    // Construir el filtro de búsqueda
    const filter: any = 
      search 
      ? { name: { $regex: search, $options: "i" }, active: true } 
      : { };
    
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId }; // Excluir al usuario actual
    }

    // Obtener usuarios paginados y filtrados
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    // Obtener el total de usuarios que coinciden con el filtro
    const total = await User.countDocuments(filter);

    return NextResponse.json({
      data: users,
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