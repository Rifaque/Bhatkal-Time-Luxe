import { useState, useEffect } from 'react';

/**
 * Returns true while the referenced element is intersecting the viewport.
 * Useful for scroll-triggered UI: show a sticky CTA only when the inline
 * version has scrolled out of view.
 */
export function useIsVisible(ref, { threshold = 0.1 } = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);

  return visible;
}
