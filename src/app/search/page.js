'use client';

import React, { Suspense } from 'react';
import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopSearchView from '@/components/DesktopSearchView';
import MobileSearchView from '@/components/MobileSearchView';
import { Sk, ProductCardSk } from '@/components/ui/skeleton';

function SearchFallback() {
  return (
    <div className="bg-[#1e1e1e] min-h-screen pt-14">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <Sk className="h-6 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSk key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) return null;
  return isDesktop ? <DesktopSearchView /> : <MobileSearchView />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
