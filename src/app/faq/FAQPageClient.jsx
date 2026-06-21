'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopFAQView from '@/components/DesktopFAQView';
import MobileFAQView from './MobileFAQView';

export default function FAQPageClient() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopFAQView /> : <MobileFAQView />;
}
