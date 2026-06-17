'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopHomeView from '@/components/DesktopHomeView';
import MobileHomeView from '@/components/MobileHomeView';

export default function Homepage() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <DesktopHomeView /> : <MobileHomeView />;
}
