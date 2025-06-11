import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import connect from "@/lib/db";
import { BlogPost } from "@/models/BlogPost";
import { Model } from "mongoose";
import { IBlogPost } from "@/types/blog";
import { BlogPostResponse } from "@/types/api";
import { z } from "zod";

const updateStatusSchema = z.object({
  isDeleted: z.boolean(),
});

export async function GET(
  _: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connect();

    const blogPost = await (BlogPost as Model<IBlogPost>)
      .findOne({
        $or: [
          { slug: params.slug },
          { _id: params.slug }
        ]
      })
      .populate({
        path: 'author',
        select: 'name profileImg',
        model: 'User'
      })
      .lean() as any;

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const formattedBlogPost = {
      ...blogPost,
      author: {
        name: blogPost?.author?.name || 'Autor desconocido',
        profileImg: blogPost?.author?.profileImg || null,
      },
    };

    const response: BlogPostResponse = {
      success: true,
      data: formattedBlogPost,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/blogs/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
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

    const body = await request.json();
    
    // Check if this is a status update
    const statusValidation = updateStatusSchema.safeParse(body);
    if (statusValidation.success) {
      const { isDeleted } = statusValidation.data;
      await connect();

      const updatedBlogPost = await (BlogPost as Model<IBlogPost>)
        .findOneAndUpdate(
          {
            $or: [
              { slug: params.slug },
              { _id: params.slug }
            ]
          },
          { 
            $set: { 
              isDeleted,
              ...(isDeleted && { deletedAt: new Date() })
            }
          },
          { new: true }
        );

      if (!updatedBlogPost) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updatedBlogPost,
        message: "Blog post status updated successfully",
      });
    }

    // Regular blog post update
    await connect();
    const { title, content, excerpt, status, featuredImage, tags, categories } = body;

    const blogPost = await (BlogPost as Model<IBlogPost>)
      .findOneAndUpdate(
        {
          $or: [
            { slug: params.slug },
            { _id: params.slug }
          ]
        },
        {
          title,
          content,
          excerpt,
          status,
          featuredImage,
          tags,
          categories,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .populate({
        path: 'author',
        select: 'name profileImg',
        model: 'User'
      })
      .lean() as any;

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const formattedBlogPost = {
      ...blogPost,
      author: {
        name: blogPost?.author?.name || 'Autor desconocido',
        profileImg: blogPost?.author?.profileImg || null,
      },
    };

    const response: BlogPostResponse = {
      success: true,
      data: formattedBlogPost,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in PATCH /api/blogs/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
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
    const { title, description, content, image, published, scheduledFor } = await request.json();

    const blogPost = await (BlogPost as Model<IBlogPost>)
      .findOneAndUpdate(
        {
          $or: [
            { slug: params.slug },
            { _id: params.slug }
          ]
        },
        {
          $set: {
            title,
            excerpt: description,
            content,
            image,
            published,
            publishedAt: published ? new Date() : null,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
            updatedAt: new Date(),
          }
        },
        { new: true }
      )
      .populate({
        path: 'author',
        select: 'name profileImg',
        model: 'User'
      })
      .lean() as any;

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const formattedBlogPost = {
      ...blogPost,
      author: {
        name: blogPost?.author?.name || 'Autor desconocido',
        profileImg: blogPost?.author?.profileImg || null,
      },
    };

    const response: BlogPostResponse = {
      success: true,
      data: formattedBlogPost,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in PUT /api/blogs/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 