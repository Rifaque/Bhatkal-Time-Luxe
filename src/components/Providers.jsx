'use client';

import { CurrencyProvider } from '@/context/CurrencyContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import TopLoadingBar from '@/components/TopLoadingBar';

export default function Providers({ children }) {
  return (
    <StoreSettingsProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <ToastProvider>
            <TopLoadingBar />
            {children}
          </ToastProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </StoreSettingsProvider>
  );
}
