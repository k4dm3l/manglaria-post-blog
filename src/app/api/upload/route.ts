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
    const { image, folder } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: folder || 'blog',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Error uploading image' },
      { status: 500 }
    );
  }
} 