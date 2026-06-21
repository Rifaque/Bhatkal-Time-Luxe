'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, X, Heart } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useWishlist } from '@/context/WishlistContext';
import { useWishlistProducts } from '@/hooks/useWishlistProducts';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { getImageUrl } from '@/lib/image';
import { Sk } from '@/components/ui/skeleton';

function WishlistCard({ product, onAddToCart, onWhatsapp, onRemove }) {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const salePrice = product.salePrice ?? product.priceKwd ?? 0;

  return (
    <div className="shrink-0 w-40 bg-[#171717] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D1B23E]/20 transition-all">
      {/* Image */}
      <div
        onClick={() => router.push(`/product/${product._id}`)}
        className="relative bg-[#f0eeea] cursor-pointer"
        style={{ aspectRatio: '1/1' }}
      >
        <img
          src={getImageUrl(product.images?.[0] || product.image)}
          alt={product.name}
          className="w-full h-full object-contain p-3"
          onError={(e) => { e.target.src = '/assets/images/fallback-image.webp'; }}
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(product._id); }}
          aria-label="Remove from wishlist"
          className="absolute top-1.5 right-1.5 bg-black/30 backdrop-blur-sm p-1 rounded-full hover:bg-red-500/60 transition-colors"
        >
          <X size={11} className="text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="px-2.5 py-2 space-y-1.5">
        <p className="text-[9px] uppercase tracking-widest text-[#D1B23E] font-bold truncate">
          {product.brand?.name}
        </p>
        <p
          onClick={() => router.push(`/product/${product._id}`)}
          className="text-[10px] text-white font-medium truncate leading-tight cursor-pointer hover:text-[#D1B23E] transition-colors"
        >
          {product.name}
        </p>
        <p className="text-xs font-bold text-[#D1B23E]">{formatPrice(salePrice)}</p>

        {/* Actions */}
        <div className="flex gap-1.5 pt-0.5">
          <button
            onClick={() => onAddToCart(product._id)}
            disabled={!product.inStock}
            className="flex-1 flex items-center justify-center gap-1 bg-[#D1B23E] hover:bg-[#c1a22e] text-black text-[9px] font-bold py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart size={9} />
            {product.inStock ? 'Add' : 'Sold Out'}
          </button>
          {product.inStock && (
            <button
              onClick={() => onWhatsapp(product._id)}
              aria-label="Buy via WhatsApp"
              className="flex items-center justify-center bg-[#171717] border border-white/10 hover:border-[#25D366]/40 p-1.5 rounded-lg transition-colors"
            >
              <FaWhatsapp size={11} style={{ color: '#25D366' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WishlistSavedSection({ title = 'Saved Timepieces', className = '', excludeId }) {
  const { remove } = useWishlist();
  const { products, loading } = useWishlistProducts();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const router = useRouter();

  const visible = excludeId ? products.filter((p) => p._id !== excludeId) : products;

  if (!loading && visible.length === 0) return null;

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart', { product: productId, quantity: 1 });
      window.dispatchEvent(new Event('cart-updated'));
      toast({ message: 'Watch added to your cart.', type: 'success' });
    } catch {
      toast({ message: 'Failed to add to cart.', type: 'error' });
    }
  };

  const openWhatsapp = async (productId) => {
    try {
      const res = await fetch(`/api/product/${productId}/checkout?currency=${currency}`);
      const data = await res.json();
      if (data.whatsappUrl) window.open(data.whatsappUrl, '_blank');
      if (data.orderId) {
        router.push(`/order-confirmation?orderId=${data.orderId}&total=${data.total}`);
      }
    } catch {
      router.push(`/product/${productId}`);
    }
  };

  return (
    <section className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Heart size={14} className="text-[#D1B23E]" fill="#D1B23E" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">{title}</h2>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-40">
              <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden">
                <Sk className="w-full !rounded-none" style={{ aspectRatio: '1/1' }} />
                <div className="px-2.5 py-2 space-y-1.5">
                  <Sk className="h-2 w-1/2" />
                  <Sk className="h-2.5 w-3/4" />
                  <Sk className="h-3 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {visible.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onAddToCart={addToCart}
              onWhatsapp={openWhatsapp}
              onRemove={remove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
