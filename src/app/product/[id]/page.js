import ProductPageClient from './ProductPageClient';
import { connectToDatabase } from '@/lib/mongodb';

export const revalidate = 3600; // ISR: regenerate at most every 1 hour

async function getProduct(id) {
  try {
    await connectToDatabase();
    const { Product } = await import('@/models/Schemas');
    const product = await Product.findById(id).populate('brand', 'name').lean();
    return product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const brandName = product.brand?.name;
  const title = brandName
    ? `${product.name} — ${brandName}`
    : product.name;
  const description =
    product.about ||
    `${product.name}${brandName ? ` by ${brandName}` : ''} — a premium luxury timepiece available at Bhatkal Time Luxe.`;
  const image = product.images?.[0] || product.image || null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image && {
        images: [{ url: image, width: 800, height: 800, alt: product.name }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  const BASE_URL = 'https://bhatkaltimeluxe.in';

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.about || `${product.name} — premium luxury timepiece.`,
        brand: product.brand?.name
          ? { '@type': 'Brand', name: product.brand.name }
          : undefined,
        sku: product.reference || undefined,
        image: product.images?.length > 0 ? product.images : undefined,
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'KWD',
          price: product.salePrice ?? product.priceKwd ?? 0,
          availability: product.inStock !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `${BASE_URL}/product/${id}`,
          seller: { '@type': 'Organization', name: 'Bhatkal Time Luxe' },
        },
      }
    : null;

  const breadcrumbSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          ...(product.brand?.name
            ? [{ '@type': 'ListItem', position: 2, name: product.brand.name, item: `${BASE_URL}/brands` }]
            : []),
          { '@type': 'ListItem', position: product.brand?.name ? 3 : 2, name: product.name },
        ],
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ProductPageClient />
    </>
  );
}
