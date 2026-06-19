'use client';

import React, { Suspense } from 'react';
import useIsDesktop from '@/hooks/useIsDesktop';
import DesktopSearchView from '@/components/DesktopSearchView';
import MobileSearchView from '@/components/MobileSearchView';

function SearchFallback() {
  return (
    <div className="bg-[#1e1e1e] min-h-screen pt-14">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="h-6 bg-[#252525] rounded animate-pulse w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
              <div className="bg-[#252525]" style={{ aspectRatio: '1/1' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#252525] rounded w-3/4" />
                <div className="h-4 bg-[#252525] rounded w-1/2" />
              </div>
            </div>
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
