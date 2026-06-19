import ProductPageClient from './ProductPageClient';
import { connectToDatabase } from '@/lib/mongodb';

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

  const jsonLd = product
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
        offers: {
          '@type': 'Offer',
          priceCurrency: 'KWD',
          price: product.priceKwd ?? 0,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `https://bhatkaltimeluxe.in/product/${product._id}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient />
    </>
  );
}
