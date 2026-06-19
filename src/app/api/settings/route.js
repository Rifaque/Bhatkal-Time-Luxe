import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}
