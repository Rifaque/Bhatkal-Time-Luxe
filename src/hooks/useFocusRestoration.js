'use client';
import { useEffect, useRef } from 'react';

export function useFocusRestoration(isOpen) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        // Small delay to let modal exit animation finish
        const timer = setTimeout(() => {
          previousFocusRef.current?.focus();
          previousFocusRef.current = null;
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);
}
