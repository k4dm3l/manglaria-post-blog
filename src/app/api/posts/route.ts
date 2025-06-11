import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";
import connect from "@/lib/db";
import { BlogPost } from "@/models/BlogPost";
import { Model } from "mongoose";

interface Author {
  name: string;
  profileImg: string | null;
}

interface BlogPostWithAuthor {
  _id: string;
  title: string;
  description: string;
  author: Author;
  image: string;
  isDeleted: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    await connect();

    const query: Record<string, unknown> = { isDeleted: false };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await (BlogPost as Model<typeof BlogPost>)
      .find(query)
      .populate({
        path: 'author',
        select: 'name profileImg',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as BlogPostWithAuthor[];

    const formattedPosts = posts.map((post) => ({
      ...post,
      author: {
        name: post?.author?.name || 'Autor desconocido',
        profileImg: post.author?.profileImg || null,
      },
    }));

    const total = await (BlogPost as Model<typeof BlogPost>).countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      fromCache: false,
    });
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 