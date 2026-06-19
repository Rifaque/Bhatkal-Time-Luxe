'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopContactView from '@/components/DesktopContactView';
import MobileContactView from './MobileContactView';

export default function ContactPage() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopContactView /> : <MobileContactView />;
}
