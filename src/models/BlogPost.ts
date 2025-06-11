import mongoose, { Schema } from 'mongoose';
import { IBlogPost } from '@/types/blog';

const blogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  type: { type: String, enum: ['blog', 'news'], required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  image: { type: String, required: true },
  imagePublicId: String,
  scheduledFor: Date,
  publishedAt: Date,
  published: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const BlogPost = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', blogPostSchema);