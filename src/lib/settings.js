import { connectToDatabase } from '@/lib/mongodb';
import { Settings } from '@/models/Schemas';

const DEFAULTS = {
  storeName: 'Bhatkal Time Luxe',
  supportEmail: '',
  supportPhone: '',
  whatsappNumber: '',
  businessAddress: '',
};

const cache = new Map();
const TTL = 5 * 60 * 1000;

export async function getSettings() {
  const now = Date.now();
  const cached = cache.get('settings');
  if (cached && now - cached.ts < TTL) return cached.data;

  try {
    await connectToDatabase();
    const doc = await Settings.findOneAndUpdate(
      { singleton: 'global' },
      { $setOnInsert: { singleton: 'global' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    const data = {
      storeName: doc.storeName || DEFAULTS.storeName,
      supportEmail: doc.supportEmail || DEFAULTS.supportEmail,
      supportPhone: doc.supportPhone || DEFAULTS.supportPhone,
      whatsappNumber: doc.whatsappNumber || process.env.WHATSAPP_NUMBER || DEFAULTS.whatsappNumber,
      businessAddress: doc.businessAddress || DEFAULTS.businessAddress,
      homepageContent: doc.homepageContent || {},
    };

    cache.set('settings', { data, ts: now });
    return data;
  } catch (err) {
    console.warn('[settings] DB unavailable, using defaults:', err.message);
    return { ...DEFAULTS, whatsappNumber: process.env.WHATSAPP_NUMBER || '' };
  }
}

export function clearSettingsCache() {
  cache.delete('settings');
}
