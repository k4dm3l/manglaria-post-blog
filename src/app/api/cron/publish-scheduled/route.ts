import { NextResponse } from 'next/server';
import { publishScheduledContent } from '@/lib/scheduler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Verify the request is from a trusted source
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const publishedCount = await publishScheduledContent();
    
    return NextResponse.json({
      success: true,
      published: publishedCount,
    });
  } catch (error) {
    console.error('Error in publish-scheduled endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 