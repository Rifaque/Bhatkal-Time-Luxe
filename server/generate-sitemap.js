const fs = require('fs');
const { MongoClient } = require('mongodb');

const BASE_URL = 'https://bhatkaltimeluxe.in';
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'bhatkaltimeluxe';

async function generateSitemap() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const brands = await db.collection('brands').find({}).toArray();
    const products = await db.collection('products').find({}).toArray();

    const urls = [
      `${BASE_URL}/`,
      `${BASE_URL}/brands`,
      `${BASE_URL}/faq`,
      `${BASE_URL}/contact`,
      ...brands.map((b) => `${BASE_URL}/brands/${b._id}`),
      ...products.map((p) => `${BASE_URL}/product/${p._id}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n${
      urls
        .map((url) => {
          return `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
        })
        .join('\n')
    }\n</urlset>`;

    fs.writeFileSync('public/sitemap.xml', xml);
    console.log('✅ Sitemap generated at public/sitemap.xml');
  } catch (err) {
    console.error('❌ Failed to generate sitemap:', err);
  } finally {
    await client.close();
  }
}

generateSitemap();
