import { useState, useEffect } from 'react';

export default function useIsDesktop(breakpoint = 1200) {
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isDesktop;
}
