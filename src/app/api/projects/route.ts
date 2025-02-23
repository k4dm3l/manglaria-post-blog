import Project from "@/models/Project";
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const filter: any = 
      search 
      ? { title: { $regex: search, $options: "i" } } 
      : { };
    
    const projects = await Project.find(filter)
      .select("-content")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name profileImg',
      })
      .exec();

    const formattedProjects = projects.map((project) => ({
      ...project.toObject(),
      author: {
        name: project.author.name,
        profileImg: project.author.profileImg || null,
      },
    }));

    const total = await Project.countDocuments(filter);

    return NextResponse.json({
      data: formattedProjects,
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