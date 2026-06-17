'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, ShieldCheck, Truck, RotateCcw, Check, ShoppingCart, Eye } from 'lucide-react';
import useProductPageLogic from '@/hooks/useProductPageLogic';
import DesktopNavbar from '@/components/DesktopNavbar';
import DesktopFooter from '@/components/DesktopFooter';
import QuickViewModal from '@/components/QuickViewModal';
import Loader from '@/components/Loader';
import { getImageUrl } from '@/lib/image';
import axios from 'axios';

export default function DesktopProductView() {
  const {
    product,
    loading,
    error,
    notification,
    setNotification,
    buyNow,
    router,
  } = useProductPageLogic();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  const [quickViewId, setQuickViewId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  // Fetch related products from the same brand
  useEffect(() => {
    if (!product || !product.brand?._id) return;
    fetch(`/api/products/brand/${product.brand._id}`)
      .then((res) => res.json())
      .then((data) => {
        // Filter out current product
        const filtered = data.filter((p) => p._id !== product._id);
        setRelatedProducts(filtered.slice(0, 4));
      })
      .catch((err) => console.error('Failed to fetch related products', err));
  }, [product]);

  const addToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    setAddedMessage('');
    try {
      await axios.post('/api/cart', { product: product._id, quantity: 1 });
      setAddedMessage('Added to cart!');
      window.dispatchEvent(new Event('cart-updated'));
      setTimeout(() => setAddedMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add to cart', err);
      setAddedMessage('Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col justify-between">
        <DesktopNavbar />
        <p className="text-red-500 text-center p-8 flex-1 flex items-center justify-center font-serif">
          {error || 'Product not found'}
        </p>
        <DesktopFooter />
      </div>
    );
  }

  const imagesList = product.images?.length > 0 ? product.images : [product.image];

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col justify-between">
      {/* Premium Header */}
      <DesktopNavbar />

      {/* Main product wrapper */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16 w-full flex-1 space-y-20">
        
        {/* Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-white/10 rounded-3xl p-8 flex items-center justify-center h-[500px] overflow-hidden shadow-xl">
              <img
                src={getImageUrl(imagesList[activeImageIdx])}
                alt={product.name}
                className="max-h-full max-w-full object-contain mx-auto transition-all duration-300"
                onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
              />
            </div>
            
            {/* Gallery Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-4">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 p-2 bg-white rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden ${
                      activeImageIdx === idx ? 'border-[#D1B23E]' : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt="Thumbnail"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Spec Sheet & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs tracking-widest text-[#D1B23E] uppercase font-bold">
                {product.brand?.name}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight mt-1.5 leading-tight">
                {product.name}
              </h1>
              
              {/* Ratings */}
              <div className="flex items-center gap-1.5 mt-3 text-[#D1B23E]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-xs text-gray-400 font-sans ml-2">(4.9 out of 5 from client appraisals)</span>
              </div>
            </div>

            {/* Pricing Panel */}
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-end gap-3.5">
                <span className="text-3xl font-bold text-white">
                  ₹{new Intl.NumberFormat('en-IN').format(product.price)}
                </span>
                {product.MRP > product.price && (
                  <>
                    <span className="text-lg text-gray-500 line-through opacity-75">
                      ₹{new Intl.NumberFormat('en-IN').format(product.MRP)}
                    </span>
                    <span className="bg-[#D1B23E] text-black px-2.5 py-0.5 text-xs rounded font-bold uppercase tracking-wider">
                      {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-bold text-gray-300">
                  {product.inStock ? 'In stock and ready to ship' : 'Temporarily unavailable'}
                </span>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Timepiece Specifications</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-white/5 pt-3">
                <div className="py-1 flex justify-between border-b border-white/5"><span className="text-gray-500">Colorway</span> <span className="font-semibold text-white">{product.color || 'Classic'}</span></div>
                <div className="py-1 flex justify-between border-b border-white/5"><span className="text-gray-500">Collection</span> <span className="font-semibold text-white">Luxury Automatics</span></div>
                <div className="py-1 flex justify-between border-b border-white/5"><span className="text-gray-500">Certification</span> <span className="font-semibold text-white">Fully Verified</span></div>
                <div className="py-1 flex justify-between border-b border-white/5"><span className="text-gray-500">Secured Shipping</span> <span className="font-semibold text-white">Complimentary</span></div>
              </div>
            </div>

            {/* About / Narrative */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Watch Narrative</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-serif">
                {product.about || 'A masterpiece of horological engineering. Features pristine finish, structural resistance, and a reliable calibrated movement.'}
              </p>
            </div>

            {/* Actions Panel */}
            <div className="pt-6 space-y-4">
              {addedMessage && (
                <div className="flex items-center justify-center gap-1 text-[#D1B23E] font-semibold text-sm animate-bounce">
                  <Check size={16} /> {addedMessage}
                </div>
              )}
              {notification && <p className="text-sm text-red-400 text-center font-semibold">{notification}</p>}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={addToCart}
                  disabled={!product.inStock || addingToCart}
                  className="w-full !bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-4 rounded-xl text-base transition-all"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={buyNow}
                  disabled={!product.inStock}
                  className="w-full !bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold py-4 rounded-xl text-base transition-all"
                >
                  Buy via WhatsApp
                </Button>
              </div>
            </div>

            {/* Detail Trust Section */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 text-center text-xs text-gray-400">
              <div className="flex flex-col items-center space-y-1"><ShieldCheck size={20} className="text-[#D1B23E]" /> <span className="font-semibold">Horology Checked</span></div>
              <div className="flex flex-col items-center space-y-1"><Truck size={20} className="text-[#D1B23E]" /> <span className="font-semibold">Secured Free Transit</span></div>
              <div className="flex flex-col items-center space-y-1"><RotateCcw size={20} className="text-[#D1B23E]" /> <span className="font-semibold">Support Concierge</span></div>
            </div>

          </div>
        </div>

        {/* Related Products from this Brand */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-10 border-t border-white/5">
            <div className="text-left">
              <span className="text-xs uppercase tracking-widest text-[#D1B23E] font-bold block mb-1">More from the House</span>
              <h2 className="text-2xl font-serif font-bold">Related Timepieces</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <div
                  key={p._id}
                  onMouseEnter={() => setHoveredCardId(p._id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="relative group bg-[#171717] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {p.MRP > p.price && (
                    <span className="absolute top-4 left-4 z-10 bg-[#D1B23E] text-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      {Math.round(((p.MRP - p.price) / p.MRP) * 100)}% OFF
                    </span>
                  )}

                  <div 
                    onClick={() => router.push(`/product/${p._id}`)}
                    className="bg-white p-4 rounded-xl h-64 flex items-center justify-center overflow-hidden relative cursor-pointer"
                  >
                    <img
                      src={getImageUrl(p.images?.[0] || p.image)}
                      alt={p.name}
                      className="max-h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                    />
                    <div className={`absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-opacity duration-300 ${hoveredCardId === p._id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewId(p._id);
                        }}
                        className="!bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold rounded-full px-5 py-2.5 flex items-center gap-1.5 shadow-lg text-xs"
                      >
                        <Eye size={14} /> Quick View
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div onClick={() => router.push(`/product/${p._id}`)} className="cursor-pointer">
                      <span className="text-[10px] uppercase tracking-widest text-[#D1B23E] font-bold">
                        {product.brand?.name}
                      </span>
                      <h3 className="text-base font-bold text-white truncate hover:text-[#D1B23E] transition-colors mt-0.5">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm font-bold text-white">
                        ₹{new Intl.NumberFormat('en-IN').format(p.price)}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          axios.post('/api/cart', { product: p._id, quantity: 1 }).then(() => {
                            window.dispatchEvent(new Event('cart-updated'));
                            alert('Watch added to cart!');
                          });
                        }}
                        disabled={!p.inStock}
                        className="!bg-white/5 border border-white/10 hover:border-[#D1B23E] hover:bg-[#D1B23E] hover:text-black font-semibold text-xs py-1.5 px-3 rounded-lg transition-all"
                      >
                        {p.inStock ? '+ Add' : 'OOS'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Premium Footer */}
      <DesktopFooter />

      {/* Related Products Quick View Overlay */}
      {quickViewId && (
        <QuickViewModal 
          productId={quickViewId} 
          onClose={() => setQuickViewId(null)} 
        />
      )}
    </div>
  );
}
