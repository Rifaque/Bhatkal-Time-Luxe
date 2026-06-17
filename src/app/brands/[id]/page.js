'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopBrandDetailView from '@/components/DesktopBrandDetailView';
import MobileBrandDetailView from '@/components/MobileBrandDetailView';

export default function BrandDetailsPage() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <DesktopBrandDetailView /> : <MobileBrandDetailView />;
}
