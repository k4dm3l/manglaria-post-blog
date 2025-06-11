import { z } from 'zod';

// Schema for blog post list query parameters
export const blogListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1)
    .transform((val) => Math.max(1, val)),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10)
    .transform((val) => Math.min(100, val)),
  search: z.string().trim().max(100).optional().default(''),
}).strict();

// Schema for blog post creation
export const blogCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(500),
  content: z.string().min(50),
  image: z.string().url().optional(),
}).strict();

// Schema for blog post update
export const blogUpdateSchema = blogCreateSchema.partial().strict();

// Schema for blog post deletion
export const blogDeleteSchema = z.object({
  isDeleted: z.boolean(),
}).strict();

// Type inference
export type BlogListQuery = z.infer<typeof blogListQuerySchema>;
export type BlogCreate = z.infer<typeof blogCreateSchema>;
export type BlogUpdate = z.infer<typeof blogUpdateSchema>;
export type BlogDelete = z.infer<typeof blogDeleteSchema>;

// Validation helper function
export async function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<{ success: boolean; data?: z.infer<T>; error?: string }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((err) => err.message).join(', '),
      };
    }
    return {
      success: false,
      error: 'Validation error',
    };
  }
} 