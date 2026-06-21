'use client';

// ─── Atom ────────────────────────────────────────────────────────────────────
// Renders a single shimmer rectangle. Pass Tailwind width/height/radius overrides,
// or an inline `style` for dynamic dimensions (e.g. percentage widths).
export function Sk({ className = '', style }) {
  return <div className={`sk ${className}`} style={style} />;
}

// ─── Product card skeleton ────────────────────────────────────────────────────
// Matches the luxury product card: full-bleed image, name, brand, price + icon row.
export function ProductCardSk() {
  return (
    <div className="rounded-2xl bg-[#1c1c1c] border border-white/[0.04] overflow-hidden">
      <Sk className="aspect-square w-full !rounded-none" />
      <div className="p-4 space-y-2.5">
        <Sk className="h-3 w-3/4" />
        <Sk className="h-2.5 w-1/2" />
        <div className="flex items-center justify-between pt-1.5">
          <Sk className="h-5 w-1/3" />
          <Sk className="h-8 w-8 !rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Brand card skeleton ──────────────────────────────────────────────────────
// Matches the centered logo + name card used on the Brands page and Home.
export function BrandCardSk() {
  return (
    <div className="flex flex-col items-center bg-[#1c1c1c] border border-white/[0.04] p-8 rounded-2xl gap-4">
      <Sk className="w-16 h-16 !rounded-xl" />
      <Sk className="h-3 w-20" />
    </div>
  );
}

// ─── Cart item skeleton ───────────────────────────────────────────────────────
// Matches the horizontal cart row: thumbnail, name/brand/price, quantity control.
export function CartItemSk() {
  return (
    <div className="flex items-center gap-5 py-5 border-b border-white/5">
      <Sk className="w-20 h-20 shrink-0 !rounded-xl" />
      <div className="flex-1 space-y-2.5">
        <Sk className="h-3.5 w-2/3" />
        <Sk className="h-2.5 w-1/3" />
        <Sk className="h-2.5 w-1/4" />
      </div>
      <Sk className="h-9 w-24 shrink-0" />
    </div>
  );
}

// ─── Quick-view modal skeleton ────────────────────────────────────────────────
// Fills the split-panel interior of QuickViewModal while the product fetches.
export function ModalContentSk() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-[400px]">
      <div className="md:w-1/2 bg-[#202020] flex items-center justify-center p-8 min-h-[300px] md:min-h-[450px]">
        <Sk className="w-48 h-64 !rounded-2xl" />
      </div>
      <div className="md:w-1/2 p-8 flex flex-col justify-between">
        <div className="space-y-5">
          <Sk className="h-2.5 w-20" />
          <Sk className="h-7 w-3/4" />
          <Sk className="h-7 w-1/3" />
          <div className="space-y-2 pt-3">
            <Sk className="h-2.5 w-full" />
            <Sk className="h-2.5 w-5/6" />
            <Sk className="h-2.5 w-4/5" />
            <Sk className="h-2.5 w-3/4" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Sk className="h-12 !rounded-xl" />
          <Sk className="h-12 !rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page hero skeleton ───────────────────────────────────────────────────────
// Generic section header placeholder used across page-level loading screens.
export function HeroSk({ compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Sk className="h-2.5 w-28 mx-auto" />
        <Sk className="h-8 w-72 mx-auto" />
        <Sk className="h-1 w-12 mx-auto !rounded-full" />
        <Sk className="h-3 w-80 mx-auto" />
      </div>
    );
  }
  return (
    <div className="min-h-[45vh] flex flex-col items-center justify-center gap-5">
      <Sk className="h-2.5 w-28 mx-auto" />
      <Sk className="h-10 w-80 mx-auto" />
      <Sk className="h-1 w-12 mx-auto !rounded-full" />
      <Sk className="h-3 w-96 mx-auto" />
      <Sk className="h-3 w-72 mx-auto" />
    </div>
  );
}
