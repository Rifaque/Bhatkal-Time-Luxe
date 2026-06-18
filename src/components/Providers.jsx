'use client';

import { CurrencyProvider } from '@/context/CurrencyContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import TopLoadingBar from '@/components/TopLoadingBar';

export default function Providers({ children }) {
  return (
    <CurrencyProvider>
      <WishlistProvider>
        <ToastProvider>
          <TopLoadingBar />
          {children}
        </ToastProvider>
      </WishlistProvider>
    </CurrencyProvider>
  );
}
