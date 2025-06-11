import { BlogPost } from "@/models/BlogPost";
import { IBlogPost } from "@/types/blog";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { headers } from "next/headers";
import connect from "@/lib/db";
import { FilterQuery, Model } from "mongoose";
import { setCache, generateCacheKey } from "@/lib/redis";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";
import { blogListQuerySchema, blogCreateSchema, blogUpdateSchema, blogDeleteSchema, validateRequest } from "@/lib/validations/blog";
import { BlogPostResponse, BlogPostListResponse, ApiError, BlogPostWithAuthor, NextApiResponse } from "@/types/api";

const CACHE_PREFIX = 'blog_posts';
const CACHE_TTL = 3600; // 1 hour in seconds

export async function GET(request: Request): Promise<NextApiResponse<BlogPostWithAuthor[]>> {
  return withRateLimit(rateLimiters.blogs, async () => {
    try {
      await connect();

      const { searchParams } = new URL(request.url);
      const queryParams = {
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        search: searchParams.get("search"),
      };

      // Validate query parameters
      const validation = await validateRequest(blogListQuerySchema, queryParams);
      if (!validation.success || !validation.data) {
        return NextResponse.json(
          { success: false, error: validation.error || "Invalid query parameters" } as ApiError,
          { status: 400 }
        );
      }

      const { page, limit, search } = validation.data;
      const skip = (page - 1) * limit;

      const filter: FilterQuery<IBlogPost> = {
        ...(search ? { title: { $regex: search, $options: "i" } } : {})
      };
      
      const BlogPostModel = BlogPost as Model<IBlogPost>;
      const blogPosts = await BlogPostModel.find(filter)
        .select("-content")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'author',
          select: 'name profileImg',
          model: 'User'
        })
        .lean();

      const formattedBlogPost = blogPosts.map((post: any) => ({
        ...post,
        author: {
          name: post?.author?.name || 'Autor desconocido',
          profileImg: post?.author?.profileImg || null,
        },
      })) as BlogPostWithAuthor[];

      const total = await BlogPostModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      const pagination = {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      // Cache the results
      const cacheKey = generateCacheKey(CACHE_PREFIX, {
        page,
        limit,
        search,
      });

      await setCache(cacheKey, {
        data: formattedBlogPost,
        pagination,
      }, CACHE_TTL);

      const response: BlogPostListResponse = {
        success: true,
        data: formattedBlogPost,
        pagination,
        fromCache: false,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error(error);
      const errorResponse: ApiError = {
        success: false,
        error: "Error al obtener los blog posts",
        message: error instanceof Error ? error.message : "Error desconocido"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
  });
}

export async function POST(request: Request): Promise<NextApiResponse<BlogPostWithAuthor>> {
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

export async function PUT(request: Request): Promise<NextApiResponse<BlogPostWithAuthor>> {
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

export async function DELETE(request: Request): Promise<NextApiResponse<BlogPostWithAuthor>> {
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