'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopBrandsView from '@/components/DesktopBrandsView';
import MobileBrandsView from '@/components/MobileBrandsView';

export default function BrandsPage() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopBrandsView /> : <MobileBrandsView />;
}
