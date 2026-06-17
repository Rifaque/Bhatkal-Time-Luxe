'use client';

import React, { Suspense } from 'react';
import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopSearchView from '@/components/DesktopSearchView';
import MobileSearchView from '@/components/MobileSearchView';
import Loader from '@/components/Loader';

function SearchPageContent() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopSearchView /> : <MobileSearchView />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
