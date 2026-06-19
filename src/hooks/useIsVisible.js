import { useState, useEffect } from 'react';

/**
 * Returns true while the referenced element intersects the viewport.
 *
 * threshold: 0 (default) — fires the moment the element fully leaves the
 * viewport (isIntersecting → false only when 0 px remain visible). Use
 * threshold: 0 for sticky-CTA logic so the bar appears only after the
 * inline version is completely off-screen.
 *
 * initialValue: set to true when the element is expected to be in the
 * viewport on mount (e.g. inline CTAs at the top of a page). Prevents
 * a single-frame flash of the sticky bar before the first observer fire.
 */
export function useIsVisible(ref, { threshold = 0, initialValue = false } = {}) {
  const [visible, setVisible] = useState(initialValue);

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
