import { Menu, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import useProductPageLogic from '../hooks/useProductPageLogic';
import btimehome from '../assets/images/btimehome.png';
import Loader from '../components/Loader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';

export default function DesktopProductView() {
  const {
    product,
    loading,
    error,
    notification,
    buyNow,
  } = useProductPageLogic();

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

    // If still loading, show the loader
    if (loading) {
        return (
        <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
            <Loader />
        </div>
        );
    }
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#2A2A2A] text-white overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-[#2A2A2A] shadow-md fixed top-0 left-0 right-0 z-50">
        <Button variant="ghost" onClick={() => setMenuOpen(true)}>
          <Menu size={28} className="text-[#D1B23E]" />
        </Button>
        <img
          src={btimehome}
          alt="Bhatkal Timeluxe Logo"
          className="h-16 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <Button variant="ghost" onClick={() => navigate('/search')}>
          <Search size={24} className="text-[#D1B23E]" />
        </Button>
      </header>

      {/* Notification */}
      {notification && (
        <div className="text-center py-2 bg-[#323232] text-white">
          {notification}
        </div>
      )}

      {/* Main Content */}
      <div className="h-[88vh] flex justify-center items-center px-10 mt-[12vh]">
        <div className="w-full h-full grid grid-cols-2 gap-1">
          
          {/* Left Side - Static Image */}
          <div className="bg-[#2A2A2A] flex items-center justify-center rounded-lg p-6 pl-0">
            <div className="bg-white p-4 rounded-xl w-full h-full flex items-center justify-center">
              <img
                src={`https://hz-btl.imgix.net/${product.images[0]}`}
                alt={product.name}
                className="mt-14 h-[65vh] object-contain mx-auto rounded-2xl"
                onError={(e) => (e.currentTarget.src = '/fallback-image.webp')}
              />
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="bg-[#2A2A2A] rounded-lg p-6 flex flex-col justify-between overflow-hidden">
            <div className="overflow-y-auto pr-0" style={{ maxHeight: '100%' }}>
              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-2">
                <p className="text-2xl font-semibold text-white">
                  ₹{new Intl.NumberFormat('en-IN').format(product.price)}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  ₹{new Intl.NumberFormat('en-IN').format(product.MRP)}
                </p>
                {product.MRP > product.price && (
                  <span className="bg-[#D1B23E] text-black px-2 py-1 text-xs rounded">
                    {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                  </span>
                )}
              </div>

              <p
                className={`text-md mb-4 font-medium ${
                  product.inStock ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {product.inStock ? 'Available in stock' : 'Out of Stock'}
              </p>

              <h3 className="text-lg font-semibold text-white mt-6">About</h3>
              <p className="text-[#cccccc] mt-2 leading-relaxed">{product.about}</p>
            </div>

            <div className="mt-6">
              <Button
                onClick={buyNow}
                disabled={!product.inStock}
                className="!bg-[#cca326] text-white w-full py-3 rounded-xl text-lg"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Hamburger Menu */}
            <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
