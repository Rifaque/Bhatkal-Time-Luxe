'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopFAQView from '@/components/DesktopFAQView';
import MobileFAQView from './MobileFAQView';

export default function FAQPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopFAQView /> : <MobileFAQView />;
}
