import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand, Product } from '@/models/Schemas';

const BASE_URL = 'https://bhatkaltimeluxe.in';

export async function GET() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({}).lean();
    const products = await Product.find({}).lean();

    const urls = [
      `${BASE_URL}/`,
      `${BASE_URL}/brands`,
      `${BASE_URL}/faq`,
      `${BASE_URL}/contact`,
      ...brands.map((b) => `${BASE_URL}/brands/${b._id}`),
      ...products.map((p) => `${BASE_URL}/product/${p._id}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    return `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('❌ Sitemap Generation Error:', err);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
