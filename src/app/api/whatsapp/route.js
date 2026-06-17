import { NextResponse } from 'next/server';

export async function GET(req) {
  const number = process.env.WHATSAPP_NUMBER;
  const origin = new URL(req.url).origin;
  if (!number) {
    return NextResponse.redirect(`${origin}/contact`);
  }
  const message = encodeURIComponent(
    'Hello! I need assistance finding the perfect timepiece.'
  );
  return NextResponse.redirect(`https://wa.me/${number}?text=${message}`);
}
