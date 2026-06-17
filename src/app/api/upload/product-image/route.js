import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFiles = formData.getAll('images');
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadPromises = imageFiles.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await uploadBuffer(buffer, 'products');
      return uploadResult.secure_url;
    });

    const filePaths = await Promise.all(uploadPromises);

    return NextResponse.json({ filePaths });
  } catch (err) {
    console.error('❌ Upload Product Image Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
