import { BlogPost } from '@/models/BlogPost';
import { connectToDatabase } from './mongodb';
import { Model } from 'mongoose';
import { IBlogPost } from '@/types/blog';

export async function publishScheduledContent() {
  const now = new Date();
  const posts = await (BlogPost as Model<IBlogPost>).find({
    scheduledFor: { $lte: now },
    published: false
  });

  for (const post of posts) {
    post.published = true;
    post.publishedAt = now;
    await post.save();
  }

  return posts;
}

export async function schedulePost(postId: string, scheduledFor: Date) {
  try {
    await connectToDatabase();
    
    const post = await BlogPost.findByIdAndUpdate(
      postId,
      {
        scheduledFor,
        published: false,
      },
      { new: true }
    );

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  } catch (error) {
    console.error('Error scheduling post:', error);
    throw error;
  }
}

export async function getScheduledPosts() {
  const now = new Date();
  return await (BlogPost as Model<IBlogPost>).find({
    scheduledFor: { $gt: now },
    published: false
  }).sort({ scheduledFor: 1 });
} 