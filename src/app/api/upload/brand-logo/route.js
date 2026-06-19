import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';
import { validateImageFile } from '@/lib/validate';

export async function POST(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('logo');
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileErr = validateImageFile(file);
    if (fileErr) return NextResponse.json({ error: fileErr }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadBuffer(buffer, 'brands');

    return NextResponse.json({ filePath: uploadResult.secure_url });
  } catch (err) {
    console.error('❌ Upload Brand Logo Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
