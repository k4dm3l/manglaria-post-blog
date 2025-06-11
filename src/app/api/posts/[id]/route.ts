import { NextResponse } from 'next/server';
import { BlogPost } from '@/models/BlogPost';
import { deleteImage } from '@/lib/cloudinary';
import { Model } from 'mongoose';
import { IBlogPost } from '@/types/blog';

export async function DELETE(
  request: Request, // Cambiado a Request
  // { params }: { params: { id: string } } // Formato corregido
) {
  try {
    const { id } = await request.json();
    const post = await (BlogPost as Model<IBlogPost>).findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.imagePublicId) {
      await deleteImage(post.imagePublicId);
    }

    await (BlogPost as Model<IBlogPost>).findByIdAndDelete(id);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Error deleting post' },
      { status: 500 }
    );
  }
}