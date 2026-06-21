import BrandDetailContent from './BrandDetailContent';
import { connectToDatabase } from '@/lib/mongodb';

export const revalidate = 3600; // ISR: regenerate at most every 1 hour

const BASE_URL = 'https://bhatkaltimeluxe.in';

async function getBrand(id) {
  try {
    await connectToDatabase();
    const { Brand } = await import('@/models/Schemas');
    const brand = await Brand.findById(id).lean();
    return brand;
  } catch {
    return null;
  }
}

async function getBrandProducts(brandId) {
  try {
    await connectToDatabase();
    const { Product } = await import('@/models/Schemas');
    return Product.find({ brand: brandId })
      .select('name salePrice priceKwd images inStock reference')
      .limit(10)
      .lean();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const brand = await getBrand(id);

  if (!brand) {
    return { title: 'Brand Not Found' };
  }

  return {
    title: brand.name,
    description: `Explore ${brand.name} watches at Bhatkal Time Luxe — premium luxury timepieces.`,
    openGraph: {
      title: brand.name,
      description: `Explore ${brand.name} watches at Bhatkal Time Luxe.`,
      ...(brand.logo && {
        images: [{ url: brand.logo, width: 400, height: 400, alt: brand.name }],
      }),
    },
  };
}

export default async function BrandDetailsPage({ params }) {
  const { id } = await params;
  const [brand, products] = await Promise.all([getBrand(id), getBrandProducts(id)]);

  const organizationSchema = brand
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: brand.name,
        url: `${BASE_URL}/brands/${id}`,
        ...(brand.logo && { logo: brand.logo }),
      }
    : null;

  const itemListSchema = brand && products.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${brand.name} Watches`,
        description: `Luxury timepieces from ${brand.name} available at Bhatkal Time Luxe.`,
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: p.name,
            url: `${BASE_URL}/product/${p._id}`,
            ...(p.images?.[0] && { image: p.images[0] }),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'KWD',
              price: p.salePrice ?? p.priceKwd ?? 0,
              availability: p.inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
          },
        })),
      }
    : null;

  const breadcrumbSchema = brand
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Brands', item: `${BASE_URL}/brands` },
          { '@type': 'ListItem', position: 3, name: brand.name },
        ],
      }
    : null;

  return (
    <>
      {organizationSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      )}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <BrandDetailContent />
    </>
  );
}
