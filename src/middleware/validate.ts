import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export function validate(schema: z.ZodSchema) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validatedData = await schema.parseAsync(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(
          JSON.stringify({
            error: 'Validation error',
            details: error.errors,
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Could not validate request data',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
} 