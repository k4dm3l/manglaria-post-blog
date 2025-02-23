import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileStr = body.data;

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'ml_default',
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}