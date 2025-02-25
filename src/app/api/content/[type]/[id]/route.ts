// src/app/api/content/[type]/[id]/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Project from '@/models/Project';
import '@/models/User';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string, type: string }> }
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

    const { type, id } = await params;
    
    if (type !== 'blog' && type !== 'project') {
      return NextResponse.json(
        { error: 'invalid content type ["project", "blog"]' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    await connect();

    const Model = type === 'blog' ? BlogPost : Project;
    const populateOptions = { path: 'author', select: 'name profileImg' };

    // 4. Buscar documento completo
    const document = await Model.findById(id)
      .populate(populateOptions)
      .select('-__v -isDeleted')
      .lean();

    if (!document) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(document);
    
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