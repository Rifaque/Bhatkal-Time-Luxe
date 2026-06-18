'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastItem({ toast, onRemove }) {
  const config = {
    success: { icon: CheckCircle2, iconClass: 'text-emerald-400', border: 'border-emerald-500/20' },
    error:   { icon: AlertCircle,  iconClass: 'text-red-400',     border: 'border-red-500/20' },
    info:    { icon: Info,         iconClass: 'text-[#D1B23E]',   border: 'border-[#D1B23E]/20' },
  };
  const { icon: Icon, iconClass, border } = config[toast.type] || config.info;

  return (
    <div className={`flex items-start gap-3 bg-[#1c1c1c] border ${border} rounded-2xl px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[260px] max-w-xs`}>
      <Icon size={16} className={`${iconClass} shrink-0 mt-0.5`} />
      <span className="text-sm text-white font-medium leading-snug flex-1">{toast.message}</span>
      <button onClick={onRemove} className="text-gray-500 hover:text-white transition-colors shrink-0 mt-0.5">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-[80px] right-4 md:bottom-6 md:right-6 z-[500] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
