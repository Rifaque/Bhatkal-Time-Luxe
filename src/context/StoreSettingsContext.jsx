'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const DEFAULTS = {
  storeName: 'Bhatkal Time Luxe',
  supportEmail: '',
  supportPhone: '',
  whatsappNumber: '',
  businessAddress: '',
  homepageContent: {},
};

const StoreSettingsContext = createContext(DEFAULTS);

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => {});
  }, []);

  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
