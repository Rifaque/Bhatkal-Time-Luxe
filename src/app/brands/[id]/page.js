'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopBrandDetailView from '@/components/DesktopBrandDetailView';
import MobileBrandDetailView from '@/components/MobileBrandDetailView';

export default function BrandDetailsPage() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopBrandDetailView /> : <MobileBrandDetailView />;
}
