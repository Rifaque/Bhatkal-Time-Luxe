import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ExchangeRate } from '@/models/Schemas';

export async function GET() {
  try {
    await connectToDatabase();
    const record = await ExchangeRate.findOne({ singleton: 'latest' });

    if (!record?.fetchedAt) {
      return NextResponse.json({ rates: null, status: 'no_data' });
    }

    return NextResponse.json({
      rates:     record.rates,
      fetchedAt: record.fetchedAt,
      source:    record.source,
      status:    record.status,
      base:      record.base,
    });
  } catch {
    return NextResponse.json({ rates: null, status: 'error' });
  }
}
