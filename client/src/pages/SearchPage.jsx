import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home, ShoppingCart, Menu, Search, Tag, Frown, SlidersHorizontal } from 'lucide-react';
import btimehome from '../assets/images/btimehome.webp';
import Loader from '../components/Loader';
import HamburgerMenu from '../components/HamburgerMenu';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { FaWhatsapp } from 'react-icons/fa';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([1, 10000]);
  const [showSlider, setShowSlider] = useState(false); // Toggle state
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api.bhatkaltimeluxe.in/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error("Failed to fetch products", err));
  }, []);

  // Filter products based on search query and price range
  const filteredProducts = products.filter(product => {
    const lowerQuery = query.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(lowerQuery);
    const aboutMatch = product.about && product.about.toLowerCase().includes(lowerQuery);
    const colorMatch = product.color && product.color.toLowerCase().includes(lowerQuery);
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return (nameMatch || aboutMatch || colorMatch) && priceMatch;
  });

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
      
      {/* Search input */}
      <div className="relative mt-5 mb-4 p-4">
        <input
          type="text"
          placeholder="Search by name, description, or color..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="!bg-[#5c5c5c] w-full p-2 pl-4 pr-10 rounded text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-[#D1B23E]"
        />
        <Search 
          size={20}
          className="absolute right-7 top-1/2 transform -translate-y-1/2"
        />
      </div>

      {/* Toggleable Price Range Slider */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-between px-4 py-2 !text-white border-[#D1B23E] rounded-lg"
          onClick={() => setShowSlider(!showSlider)}
        >
          Filter by Price
          <SlidersHorizontal size={20} className="text-[#D1B23E]" />
        </Button>

        {showSlider && (
          <div className="mt-4 p-4 rounded-lg !bg-[#3A3A3A] transition-all duration-300">
            <div className="flex justify-between text-white mb-2">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <Slider
              range
              min={1}
              max={10000}
              value={priceRange}
              onChange={(value) => setPriceRange(value)}
              trackStyle={[{ backgroundColor: '#D1B23E' }]}
              handleStyle={[{ borderColor: '#D1B23E' }, { borderColor: '#D1B23E' }]} 
            />
          </div>
        )}
      </div>

      {/* Conditionally display products or "No results found" */}
      {filteredProducts.length === 0 ? (
        <div className="text-center text-white p-4">
          <Frown size={40} className="mx-auto mb-2 text-gray-400" />
          <p>No results found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 p-4">
          {filteredProducts.map((product) => (
            <div 
              key={product._id}
              className="cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <Card className="p-4 !bg-[#EDEDED] rounded-2xl cursor-pointer">
                <div className="relative">
                  {product.MRP && product.price && product.MRP > product.price && (
                    <span className="absolute top-2 left-2 bg-[#D1B23E] text-black px-2 py-1 text-xs rounded">
                      {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                    </span>
                  )}
                  <img
                    src={`https://hz-btl.imgix.net/${product.images[0]}`}
                    alt={product.name}
                    className="mb-2 rounded-xl object-contain w-full h-40"
                    onError={(e) => (e.target.src = '/fallback-image.webp')}
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
      )}

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

      {/* Navigation */}
      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2">
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]" onClick={() => navigate('/')}>
          <Home size={24} />
        </Button>
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]" onClick={() => navigate('/brands')}>
          <Tag size={24} /> 
        </Button>
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]" onClick={() => navigate('/cart')}>
          <ShoppingCart size={24} />
        </Button>
      </nav>
      
      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
