import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique name
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

    // Upload to Vercel Blob
    const blob = await put(`uploads/${filename}`, buffer, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Failed to upload file to Blob storage' }, { status: 500 });
  }
}
