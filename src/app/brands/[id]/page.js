import BrandDetailContent from './BrandDetailContent';
import { connectToDatabase } from '@/lib/mongodb';

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

export default function BrandDetailsPage() {
  return <BrandDetailContent />;
}
