import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, Home, Menu, ShoppingCart, Tag } from 'lucide-react';
import btimehome from '../assets/images/btimehome.png';
import Loader from '../components/Loader';
import HamburgerMenu from '../components/HamburgerMenu';
import { FaWhatsapp } from 'react-icons/fa';
import { Card } from '../components/ui/card';
// import { Card , CardContent } from '../components/ui/card';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.bhatkaltimeluxe.in/api/brands')
      .then(res => res.json())
      .then(data => {
        // Sort brands alphabetically by name
        const sortedBrands = data.sort((a, b) => a.name.localeCompare(b.name));
        setBrands(sortedBrands);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch brands", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="!bg-[#2A2A2A] text-white min-h-screen pb-16">
      {/* Header */}
      <header className="flex justify-between items-center p-2">
        <Button variant="ghost" className="mt-2" onClick={() => setMenuOpen(true)}>
          <Menu size={28} className="text-[#D1B23E]" />
        </Button>
        <img 
          src={btimehome}
          alt="Bhatkal Timeluxe Logo" 
          className="h-16 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <Button variant="ghost" className="mt-2" onClick={() => navigate('/search')}>
          <Search size={24} className="text-[#D1B23E]" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-4xl mt-8 mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">All Brands</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <div 
              key={brand._id}
              className="cursor-pointer"
              onClick={() => navigate(`/brands/${brand._id}`)}
            >
              <Card className="!bg-[#EDEDED] flex flex-col items-center p-2">
                <div className="w-full h-24 flex items-center justify-center rounded-lg bg-[#EDEDED]">
                  <img
                    src={`https://api.bhatkaltimeluxe.in/uploads/${brand.logo}`}
                    alt={brand.name}
                    className="max-h-full object-contain mix-blend-multiply"
                    onError={(e) => (e.target.src = '/fallback-brand.png')}
                  />
                </div>
                {/* <CardContent className="p-0 mt-2">
                  <p className="text-sm font-semibold text-black text-center mt-3">
                    {brand.name.toUpperCase()}
                  </p>
                </CardContent> */}
              </Card>

            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-400 text-sm mb-6">
        <p>BHATKAL TIME LUXE</p>
        <p>
          Powered by{' '}
          <a 
            href="https://www.hubzero.in" // Replace with the actual Hubzero website
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-[#D1B23E] opacity-80 hover:underline"
          >
            Hubzero
          </a>
        </p>
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/918050858500"  // Replace with your actual WhatsApp number
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-3 z-50 bg-[#1e1e1e] p-4 rounded-full shadow-lg"
      >
        <FaWhatsapp size={24} style={{ color: "#D1B23E" }} />
      </a>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2">
        <Button
          variant="ghost"
          className="flex flex-col items-center !text-[#D1B23E]"
          onClick={() => navigate('/')}
        >
          <Home size={24} />
        </Button>
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]">
          <Tag size={24} />
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center !text-[#D1B23E]"
          onClick={() => navigate('/cart')}
        >
          <ShoppingCart size={24} />
        </Button>
      </nav>

      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
