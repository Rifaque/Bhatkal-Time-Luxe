'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopProductView from './DesktopProductView';
import MobileProductView from './MobileProductView';

export default function ProductPageClient() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopProductView /> : <MobileProductView />;
}
