import { IProject } from '@/models/Project';
import { IUser } from '@/models/User';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

// Base API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  fromCache?: boolean;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

// Auth Types
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImg?: string;
  };
  error?: string;
}

// Blog Post Types
export interface BlogPostWithAuthor {
  _id: Types.ObjectId;
  title: string;
  description: string;
  content: string;
  image?: string;
  author: {
    name: string;
    profileImg: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface BlogPostResponse extends ApiResponse<BlogPostWithAuthor> {}
export interface BlogPostListResponse extends PaginatedResponse<BlogPostWithAuthor[]> {}

// Request Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

// Cache Types
export interface CacheConfig {
  ttl: number;
  prefix: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  points: number;
  duration: number;
}

export interface RateLimitResponse {
  remaining: number;
  reset: number;
  total: number;
}

// Common Types
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  field: string;
  value: string | number | boolean;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
}

export interface QueryConfig {
  page?: number;
  limit?: number;
  sort?: {
    field: string;
    order: SortOrder;
  };
  filters?: FilterConfig[];
  search?: string;
}

export interface ProjectResponse extends ApiResponse<IProject> {}
export interface ProjectsResponse extends ApiResponse<PaginatedResponse<IProject>> {}

export interface UserResponse extends ApiResponse<IUser> {}
export interface UsersResponse extends ApiResponse<PaginatedResponse<IUser>> {}

export interface ValidationErrors {
  errors: ValidationError[];
}

// Helper type for NextResponse with ApiResponse
export type NextApiResponse<T> = Promise<NextResponse<ApiResponse<T>>>; 