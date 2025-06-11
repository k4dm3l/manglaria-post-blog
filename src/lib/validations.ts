import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user']),
  profileImg: z.string().url('Invalid image URL').optional(),
});

export const userUpdateSchema = userSchema.partial();

// Blog post validation schemas
export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  image: z.string().url('Invalid image URL'),
  author: z.string().min(1, 'Author ID is required'),
  slug: z.string().min(1, 'Slug is required'),
});

export const blogPostUpdateSchema = blogPostSchema.partial();

// Project validation schemas
export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  image: z.string().url('Invalid image URL'),
  author: z.string().min(1, 'Author ID is required'),
  slug: z.string().min(1, 'Slug is required'),
});

export const projectUpdateSchema = projectSchema.partial();

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  search: z.string().optional(),
});

// API response types
export type ApiResponse<T> = {
  data: T;
  error?: string;
  status: number;
  message?: string;
};

export type PaginatedApiResponse<T> = ApiResponse<T> & {
  pagination: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}; 