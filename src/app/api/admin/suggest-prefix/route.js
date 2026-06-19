import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { suggestReferencePrefixes } from '@/lib/reference';

export async function GET(req) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const name = url.searchParams.get('name') || '';
  const prefix = url.searchParams.get('prefix') || '';

  await connectToDatabase();

  // Direct prefix availability check — used when admin manually edits the field
  if (prefix && !name) {
    const code = prefix.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    const existing = await Brand.findOne({ referencePrefix: code }, { name: 1 }).lean();
    return NextResponse.json({ available: !existing, usedBy: existing?.name || null });
  }

  if (!name.trim()) {
    return NextResponse.json({ primary: null, alternative: null, primaryTaken: null, alternativeTaken: null });
  }

  const { primary, alternative } = suggestReferencePrefixes(name);

  const candidates = [primary, alternative].filter(Boolean);
  const taken = await Brand.find(
    { referencePrefix: { $in: candidates } },
    { referencePrefix: 1, name: 1 }
  ).lean();

  const takenMap = {};
  for (const b of taken) takenMap[b.referencePrefix] = b.name;

  // If the prefix param is also supplied (for combined check), include it
  let prefixAvailable = null;
  let prefixUsedBy = null;
  if (prefix) {
    const code = prefix.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    const existing = await Brand.findOne({ referencePrefix: code }, { name: 1 }).lean();
    prefixAvailable = !existing;
    prefixUsedBy = existing?.name || null;
  }

  return NextResponse.json({
    primary,
    alternative,
    primaryTaken: takenMap[primary] || null,
    alternativeTaken: takenMap[alternative] || null,
    ...(prefix ? { prefixAvailable, prefixUsedBy } : {}),
  });
}
