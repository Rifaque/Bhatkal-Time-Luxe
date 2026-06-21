import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Settings } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';
import { clearSettingsCache } from '@/lib/settings';

const SINGLETON_QUERY = { singleton: 'global' };

const FIELD_LIMITS = {
  storeName:       100,
  supportEmail:    254,
  supportPhone:     30,
  whatsappNumber:   30,
  businessAddress: 300,
};

async function getOrCreateSettings() {
  return Settings.findOneAndUpdate(
    SINGLETON_QUERY,
    { $setOnInsert: { singleton: 'global' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function GET(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const update = {};

    for (const [key, maxLen] of Object.entries(FIELD_LIMITS)) {
      if (key in body) {
        const val = String(body[key] ?? '').trim();
        if (val.length > maxLen) {
          return NextResponse.json(
            { error: `Field "${key}" exceeds maximum length of ${maxLen} characters` },
            { status: 400 }
          );
        }
        update[key] = val;
      }
    }

    if ('homepageContent' in body && body.homepageContent && typeof body.homepageContent === 'object') {
      const hpc = body.homepageContent;
      const HPC_FIELDS = [
        'heroHeading', 'heroSubheading', 'primaryCta', 'secondaryCta',
        'executiveTitle', 'executiveDescription', 'sportTitle', 'sportDescription',
        'brandSpotlightTitle', 'brandSpotlightDescription',
        'trust1Title', 'trust1Description', 'trust2Title', 'trust2Description',
        'trust3Title', 'trust3Description',
      ];
      const hpcUpdate = {};
      for (const field of HPC_FIELDS) {
        hpcUpdate[field] = String(hpc[field] ?? '').trim().slice(0, 500);
      }
      update.homepageContent = hpcUpdate;
    }

    await connectToDatabase();
    const settings = await Settings.findOneAndUpdate(
      SINGLETON_QUERY,
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    clearSettingsCache();

    logAdminAction({
      admin, action: 'SETTINGS_UPDATE', entity: 'Settings',
      after: update, ip: getClientIp(req),
    });

    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
