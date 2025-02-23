// src/app/api/upload-image/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    // Obtén el cuerpo de la solicitud
    const body = await request.json();
    const fileStr = body.data;

    // Sube la imagen a Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'ml_default', // Reemplaza con el nombre de tu upload preset
    });

    // Devuelve la URL segura de la imagen subida
    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}