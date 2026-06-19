import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET(req) {
  const { whatsappNumber } = await getSettings();
  const number = whatsappNumber || process.env.WHATSAPP_NUMBER;
  const origin = new URL(req.url).origin;
  if (!number) {
    return NextResponse.redirect(`${origin}/contact`);
  }
  const message = encodeURIComponent(
    'Hello! I need assistance finding the perfect timepiece.'
  );
  return NextResponse.redirect(`https://wa.me/${number}?text=${message}`);
}
