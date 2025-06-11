import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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