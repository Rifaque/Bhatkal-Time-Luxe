'use client';

import { CurrencyProvider } from '@/context/CurrencyContext';
import { ToastProvider } from '@/context/ToastContext';
import TopLoadingBar from '@/components/TopLoadingBar';

export default function Providers({ children }) {
  return (
    <CurrencyProvider>
      <ToastProvider>
        <TopLoadingBar />
        {children}
      </ToastProvider>
    </CurrencyProvider>
  );
}
