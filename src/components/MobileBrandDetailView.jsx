'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Home, Menu, ShoppingCart, Tag } from 'lucide-react';
import btimehome from '@/assets/images/btimehome.webp';
import Loader from '@/components/Loader';
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image';

export default function MobileBrandDetailView() {
  const params = useParams();
  const brandId = params?.id;
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const newArrivalsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!brandId) return;

    // Fetch brand details
    fetch(`/api/brands/${brandId}`)
      .then((res) => res.json())
      .then((data) => setBrand(data))
      .catch((err) => console.error('Failed to fetch brand details', err));

    // Fetch products for the brand
    fetch(`/api/products/brand/${brandId}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error('Failed to fetch brand products', err));
  }, [brandId]);

  if (loading) {
    return (
      <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!brand) return <div className="text-white text-center p-8">Loading...</div>;

  return (
    <div className="!bg-[#2A2A2A] text-white min-h-screen pb-16">
      {/* Header */}
      <header className="flex justify-between items-center p-2">
        <Button variant="ghost" className="mt-2" onClick={() => setMenuOpen(true)}>
          <Menu size={28} className="text-[#D1B23E]" />
        </Button>
        <Image
          src={btimehome}
          alt="Bhatkal Timeluxe Logo"
          className="h-16 w-auto cursor-pointer"
          onClick={() => router.push('/')}
        />
        <Button variant="ghost" className="mt-2" onClick={() => router.push('/search')}>
          <Search size={24} className="text-[#D1B23E]" />
        </Button>
      </header>

      {/* Brand Name */}
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">{brand.name}</h1>

      {/* Products Grid */}
      <section ref={newArrivalsRef} className="p-4 w-full">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="cursor-pointer"
              onClick={() => router.push(`/product/${product._id}`)}
            >
              <Card className="p-4 !bg-[#EDEDED] rounded-2xl cursor-pointer">
                <div className="relative">
                  {product.MRP && product.price && product.MRP > product.price && (
                    <span className="absolute top-2 left-2 bg-[#D1B23E] text-black px-2 py-1 text-xs rounded z-10">
                      {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                    </span>
                  )}
                  <img
                    src={getImageUrl(product.images?.[0] || product.image)}
                    alt={product.name}
                    className="mb-2 rounded-xl object-contain w-max h-40 mx-auto"
                    onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                  />
                </div>
                <CardContent>
                  <h3 className="text-sm font-semibold text-black truncate">{product.name}</h3>
                  <p className="text-sm text-black font-bold">
                    &#8377; {new Intl.NumberFormat('en-IN').format(product.price)}
                  </p>
                  {product.MRP && (
                    <p className="text-xs text-gray-600 line-through opacity-50">
                      &#8377; {new Intl.NumberFormat('en-IN').format(product.MRP)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-400 text-sm mb-6">
        <p>BHATKAL TIME LUXE</p>
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/916364282251"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-3 z-50 bg-[#1e1e1e] p-4 rounded-full shadow-lg"
      >
        <FaWhatsapp size={24} style={{ color: '#D1B23E' }} />
      </a>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2 z-40">
        <Button
          variant="ghost"
          className="flex flex-col items-center !text-[#D1B23E]"
          onClick={() => router.push('/')}
        >
          <Home size={24} />
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center !text-[#D1B23E]"
          onClick={() => router.push('/brands')}
        >
          <Tag size={24} />
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center !text-[#D1B23E]"
          onClick={() => router.push('/cart')}
        >
          <ShoppingCart size={24} />
        </Button>
      </nav>

      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
