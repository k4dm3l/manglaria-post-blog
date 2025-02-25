import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Project from '@/models/Project';
import '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.CONTENT_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await params;
    if (type !== 'blog' && type !== 'project') {
      return NextResponse.json(
        { error: 'invalid content type ["project", "blog"]' },
        { status: 400 }
      );
    }

    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const Model = type === 'blog' ? BlogPost : Project;
    const populateOptions = { path: 'author', select: 'name profileImg' };

    const data = await Model.find({ isDeleted: false })
      .select('-content -__v')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate(populateOptions)
      .lean();

    const total = await Model.countDocuments({ isDeleted: false });

    const response = NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.ALLOWED_ORIGIN || '*'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET');

    return response;
  } catch (error) {
    console.error('Error retriving content:', error);
    return NextResponse.json(
      { error: 'Internal Error' },
      { status: 500 }
    );
  }
}