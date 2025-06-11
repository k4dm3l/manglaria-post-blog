import { BlogPost } from "@/models/BlogPost";
import { IBlogPost } from "@/types/blog";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { headers } from "next/headers";
import connect from "@/lib/db";
import { Model } from "mongoose";
import { setCache, generateCacheKey } from "@/lib/redis";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";
import { blogCreateSchema, blogUpdateSchema, blogDeleteSchema, validateRequest } from "@/lib/validations/blog";
import { BlogPostResponse, ApiError, BlogPostWithAuthor } from "@/types/api";

const CACHE_PREFIX = 'blog_posts';
const CACHE_TTL = 3600; // 1 hour in seconds

interface PopulatedBlogPost extends Omit<IBlogPost, 'author'> {
  author: {
    name: string;
    profileImg: string | null;
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as { role: string };
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await (BlogPost as Model<IBlogPost>).countDocuments(query);
    const blogPosts = (await (BlogPost as Model<IBlogPost>)
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "author",
        select: "name profileImg",
        model: "User",
      })
      .lean()) as unknown as PopulatedBlogPost[];

    const formattedBlogPosts = blogPosts.map((post) => ({
      ...post,
      author: {
        name: post.author.name || "Autor desconocido",
        profileImg: post.author.profileImg || null,
      },
    }));

    const totalPages = Math.ceil(total / limit);

    // Cache the results
    const cacheKey = generateCacheKey(CACHE_PREFIX, {
      page,
      limit,
      search,
    });

    await setCache(cacheKey, {
      data: formattedBlogPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }, CACHE_TTL);

    return NextResponse.json({
      success: true,
      data: {
        items: formattedBlogPosts,
        total,
        page,
        limit,
        totalPages,
      },
      fromCache: false,
    });
  } catch (error) {
    console.error("Error in GET /api/blogs:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  return withRateLimit(rateLimiters.blogs, async () => {
    try {
      await connect();

      const headersList = await headers();
      const authHeader = headersList.get("authorization");

      const body = await request.json();

      // Validate request body
      const validation = await validateRequest(blogCreateSchema, body);
      if (!validation.success || !validation.data) {
        return NextResponse.json(
          { success: false, error: validation.error || "Invalid request body" } as ApiError,
          { status: 400 }
        );
      }

      const { title, description, content, image } = validation.data;

      // Create new blog post
      const blogPost = new BlogPost({
        title,
        description,
        content,
        image,
        author: authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : (await getServerSession(authOptions))?.user?.id,
      });

      await blogPost.save();

      // Invalidate cache for blog posts list
      const cacheKey = generateCacheKey(CACHE_PREFIX, {});
      await setCache(cacheKey, null, 0); // Delete cache

      const response: BlogPostResponse = {
        success: true,
        data: blogPost as unknown as BlogPostWithAuthor,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      console.error(error);
      const errorResponse: ApiError = {
        success: false,
        error: "Error al crear el blog post",
        message: error instanceof Error ? error.message : "Error desconocido"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
  });
}

export async function PUT(request: Request): Promise<NextResponse> {
  return withRateLimit(rateLimiters.blogs, async () => {
    try {
      await connect();

      const body = await request.json();
      const { id, ...updateData } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "ID del blog post requerido" } as ApiError, { status: 400 });
      }

      // Validate update data
      const validation = await validateRequest(blogUpdateSchema, updateData);
      if (!validation.success || !validation.data) {
        return NextResponse.json(
          { success: false, error: validation.error || "Invalid request body" } as ApiError,
          { status: 400 }
        );
      }

      // Find and update the blog post
      const BlogPostModel = BlogPost as Model<IBlogPost>;
      const updatedBlogPost = await BlogPostModel.findOneAndUpdate(
        { _id: id },
        validation.data,
        { new: true }
      );

      if (!updatedBlogPost) {
        return NextResponse.json({ success: false, error: "Blog post no encontrado o no autorizado" } as ApiError, { status: 404 });
      }

      // Invalidate cache for blog posts list
      const cacheKey = generateCacheKey(CACHE_PREFIX, {});
      await setCache(cacheKey, null, 0); // Delete cache

      const response: BlogPostResponse = {
        success: true,
        data: updatedBlogPost as unknown as BlogPostWithAuthor,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error(error);
      const errorResponse: ApiError = {
        success: false,
        error: "Error al actualizar el blog post",
        message: error instanceof Error ? error.message : "Error desconocido"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
  });
}

export async function DELETE(request: Request): Promise<NextResponse> {
  return withRateLimit(rateLimiters.blogs, async () => {
    try {
      await connect();

      const body = await request.json();
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "ID del blog post requerido" } as ApiError, { status: 400 });
      }

      // Validate delete request
      const validation = await validateRequest(blogDeleteSchema, { isDeleted: true });
      if (!validation.success || !validation.data) {
        return NextResponse.json(
          { success: false, error: validation.error || "Invalid request body" } as ApiError,
          { status: 400 }
        );
      }

      // Find and soft delete the blog post
      const BlogPostModel = BlogPost as Model<IBlogPost>;
      const deletedBlogPost = await BlogPostModel.findOneAndUpdate(
        { _id: id },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );

      if (!deletedBlogPost) {
        return NextResponse.json({ success: false, error: "Blog post no encontrado o no autorizado" } as ApiError, { status: 404 });
      }

      // Invalidate cache for blog posts list
      const cacheKey = generateCacheKey(CACHE_PREFIX, {});
      await setCache(cacheKey, null, 0); // Delete cache

      const response: BlogPostResponse = {
        success: true,
        data: deletedBlogPost as unknown as BlogPostWithAuthor,
        message: "Blog post eliminado exitosamente"
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error(error);
      const errorResponse: ApiError = {
        success: false,
        error: "Error al eliminar el blog post",
        message: error instanceof Error ? error.message : "Error desconocido"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
  });
}