import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ExchangeRate } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';

const SUPPORTED = ['KWD', 'INR', 'USD', 'EUR', 'GBP', 'AUD', 'AED', 'SAR', 'BHD', 'QAR', 'OMR'];

export async function POST(request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/KWD', {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    if (data.result !== 'success') throw new Error(data['error-type'] || 'Unknown API error');

    // Always ensure KWD = 1; filter to supported currencies only
    const rates = { KWD: 1 };
    for (const code of SUPPORTED) {
      if (data.rates[code] != null) rates[code] = data.rates[code];
    }

    const record = await ExchangeRate.findOneAndUpdate(
      { singleton: 'latest' },
      { base: 'KWD', rates, source: 'open.er-api.com', fetchedAt: new Date(), status: 'ok', errorMessage: '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      rates:     record.rates,
      fetchedAt: record.fetchedAt,
      source:    record.source,
      status:    'ok',
    });
  } catch (err) {
    // Mark stale but keep existing rates intact
    await ExchangeRate.findOneAndUpdate(
      { singleton: 'latest' },
      { status: 'error', errorMessage: err.message },
      { upsert: true }
    ).catch(() => {});

    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
