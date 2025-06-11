import { NextResponse } from 'next/server';
import { BlogPost } from '@/models/BlogPost';
import { deleteImage } from '@/lib/cloudinary';
import { Model } from 'mongoose';
import { IBlogPost } from '@/types/blog';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await (BlogPost as Model<IBlogPost>).findById(params.id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it exists
    if (post.imagePublicId) {
      await deleteImage(post.imagePublicId);
    }

    await (BlogPost as Model<IBlogPost>).findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Error deleting post' },
      { status: 500 }
    );
  }
} 