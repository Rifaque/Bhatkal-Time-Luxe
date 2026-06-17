'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

export default function TopLoadingBar() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [pct, setPct] = useState(0);
  const tickRef = useRef(null);

  const start = useCallback(() => {
    clearInterval(tickRef.current);
    setPct(10);
    setPhase('running');
    let p = 10;
    tickRef.current = setInterval(() => {
      p += (88 - p) * 0.055;
      if (p > 87.5) p = 87.5;
      setPct(p);
    }, 120);
  }, []);

  const finish = useCallback(() => {
    clearInterval(tickRef.current);
    setPct(100);
    setPhase('done');
    setTimeout(() => setPhase('idle'), 620);
  }, []);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      finish();
    }
  }, [pathname, finish]);

  useEffect(() => {
    const onClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href)) return;
      if (anchor.target === '_blank') return;
      start();
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearInterval(tickRef.current);
    };
  }, [start]);

  if (phase === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        height: '2px',
        width: `${pct}%`,
        pointerEvents: 'none',
        background:
          'linear-gradient(90deg, rgba(201,168,93,0.4), rgba(201,168,93,1), rgba(201,168,93,0.4))',
        boxShadow:
          '0 0 8px rgba(201,168,93,0.55), 0 0 20px rgba(201,168,93,0.2)',
        opacity: phase === 'done' ? 0 : 1,
        transition:
          phase === 'done'
            ? 'width 200ms ease-out, opacity 400ms ease 180ms'
            : 'width 120ms linear',
      }}
    />
  );
}
