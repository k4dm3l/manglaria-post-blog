import Project, { IProject } from "@/models/Project";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { validateToken } from '@/lib/auth';
import connect from "@/lib/db";
import { Model } from "mongoose";

export async function GET(request: Request) {
  try {
    await connect();

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    let session = null;

    console.log("Environment:", process.env.NODE_ENV);
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    console.log("Auth Header:", authHeader);

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (!token) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      session = await validateToken(token);
      
      if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    } else {
      console.log("Attempting to get server session...");
      session = await getServerSession(authOptions);
      console.log("Session result:", session);
      
      if (!session?.user) {
        console.log("No session or user found");
        return NextResponse.json({ error: "No autorizado session" }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = 
      search 
      ? { title: { $regex: search, $options: "i" } } 
      : { };
    
    const ProjectModel = Project as Model<IProject>;
    const projects = await ProjectModel.find(filter)
      .select("-content")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name profileImg',
      })
      .exec();

    const formattedProjects = projects.map((project) => {
      const populatedProject = project.toObject() as unknown as IProject & { author: { name: string; profileImg: string | null } };
      return {
        ...populatedProject,
        author: {
          name: populatedProject.author.name,
          profileImg: populatedProject.author.profileImg || null,
        },
      };
    });

    const total = await ProjectModel.countDocuments(filter);

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
    console.error("Error in GET /api/projects:", error);
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}