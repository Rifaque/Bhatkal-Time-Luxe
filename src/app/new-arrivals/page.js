'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopNewArrivalsView from '@/components/DesktopNewArrivalsView';
import MobileNewArrivalsView from '@/components/MobileNewArrivalsView';

export default function NewArrivals() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopNewArrivalsView /> : <MobileNewArrivalsView />;
}
