'use client';

import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { getImageUrl } from '@/lib/image';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFocusRestoration } from '@/hooks/useFocusRestoration';

export default function Lightbox({ images, currentIndex, onChange, onClose }) {
  const total = images?.length ?? 0;

  useFocusRestoration(true);
  const dialogRef = useFocusTrap(true);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChange((currentIndex - 1 + total) % total);
      if (e.key === 'ArrowRight') onChange((currentIndex + 1) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onChange, currentIndex, total]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft:  () => onChange((currentIndex + 1) % total),
    onSwipedRight: () => onChange((currentIndex - 1 + total) % total),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  if (!images || total === 0) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      className="fixed inset-0 z-[200] bg-black/96 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-medium tracking-wider select-none">
          {currentIndex + 1} / {total}
        </div>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-white/8 hover:bg-white/15 transition-colors"
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange((currentIndex - 1 + total) % total); }}
          className="absolute left-3 md:left-6 text-white/60 hover:text-white p-2.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      <div
        {...swipeHandlers}
        className="w-full h-full flex items-center justify-center p-12 md:p-20"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentIndex}
          src={getImageUrl(images[currentIndex], 'product', 'desktop')}
          alt={`View ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          sizes="100vw"
          onError={(e) => { e.target.src = '/assets/images/fallback-image.webp'; }}
          draggable={false}
        />
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange((currentIndex + 1) % total); }}
          className="absolute right-3 md:right-6 text-white/60 hover:text-white p-2.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
