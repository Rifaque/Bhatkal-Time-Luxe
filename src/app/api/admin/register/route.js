import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Admin registration disabled. Use the seed script to create admin accounts.' },
    { status: 403 }
  );
}
