import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand, Product } from '@/models/Schemas';

const BASE_URL = 'https://bhatkaltimeluxe.in';

export async function GET() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({}).lean();
    const products = await Product.find({}).lean();

    const staticUrls = [
      { loc: `${BASE_URL}/`,              changefreq: 'daily',   priority: '1.0' },
      { loc: `${BASE_URL}/brands`,        changefreq: 'weekly',  priority: '0.9' },
      { loc: `${BASE_URL}/new-arrivals`,  changefreq: 'daily',   priority: '0.9' },
      { loc: `${BASE_URL}/faq`,           changefreq: 'monthly', priority: '0.5' },
      { loc: `${BASE_URL}/contact`,       changefreq: 'monthly', priority: '0.5' },
    ];
    const brandUrls = brands.map((b) => ({
      loc: `${BASE_URL}/brands/${b._id}`,
      changefreq: 'weekly',
      priority: '0.8',
    }));
    const productUrls = products.map((p) => ({
      loc: `${BASE_URL}/product/${p._id}`,
      changefreq: 'weekly',
      priority: '0.7',
    }));

    const allUrls = [...staticUrls, ...brandUrls, ...productUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(({ loc, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
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
