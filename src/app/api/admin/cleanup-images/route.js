import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export async function POST(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    // Since assets are stored in Cloudinary, we return 0 deleted files.
    // This removes the unstable Git execution vulnerabilities of the old Express server.
    return NextResponse.json({
      message: 'Cleanup completed. Asset sync is managed by Cloudinary cloud storage.',
      deletedFiles: [],
      count: 0,
    });
  } catch (err) {
    console.error('❌ Admin Cleanup Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
