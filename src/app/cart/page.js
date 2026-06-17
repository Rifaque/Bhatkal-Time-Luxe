'use client';

import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopCartView from '@/components/DesktopCartView';
import MobileCartView from '@/components/MobileCartView';

export default function CartPage() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopCartView /> : <MobileCartView />;
}
