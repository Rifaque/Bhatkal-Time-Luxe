'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopContactView from '@/components/DesktopContactView';
import MobileContactView from './MobileContactView';

export default function ContactPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopContactView /> : <MobileContactView />;
}
