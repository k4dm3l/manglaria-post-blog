import { Document, Types } from 'mongoose';

export interface IBlogPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  description: string;
  type: 'blog' | 'news';
  author: Types.ObjectId;
  tags: string[];
  image: string;
  imagePublicId?: string;
  scheduledFor?: Date;
  publishedAt?: Date;
  published: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
} 