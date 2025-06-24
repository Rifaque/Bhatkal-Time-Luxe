import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Search, Home,Menu, ShoppingCart, Tag } from 'lucide-react';
import btimehome from '../assets/images/btimehome.png';
import Loader from '../components/Loader';
import HamburgerMenu from '../components/HamburgerMenu';
import { FaWhatsapp } from 'react-icons/fa';


export default function BrandDetailsPage() {
  // Ensure your route is defined as `/brands/:id`
  const { id: brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const newArrivalsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {
    if (!brandId) return;

    // Fetch brand details for the brand name
    fetch(`https://api.bhatkaltimeluxe.in/api/brands/${brandId}`)
      .then((res) => res.json())
      .then((data) => setBrand(data))
      .catch((err) => console.error("Failed to fetch brand details", err));

    // Fetch products for the given brand
    fetch(`https://api.bhatkaltimeluxe.in/api/products/brand/${brandId}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false); 
  })
      .catch((err) => console.error("Failed to fetch brand products", err));
  }, [brandId]);
    // If still loading, show the loader
    if (loading) {
      return (
        <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
          <Loader />
        </div>
      );
    }
  if (!brand) return <div className="text-white text-center">Loading...</div>;

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

      {/* Display the brand name */}
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">{brand.name}</h1>

      <section ref={newArrivalsRef} className="p-4 w-full">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {products.map((product) => (
            <div 
              key={product._id} 
              className="cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <Card 
                className="p-4 !bg-[#EDEDED] rounded-2xl cursor-pointer"
              >
                <div className="relative">
                  {product.MRP && product.price && product.MRP > product.price && (
                    <span className="absolute !bg-[#D1B23E] text-black px-2 py-1 text-xs rounded">
                      {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                    </span>
                  )}
                  <img
                    src={`https://api.bhatkaltimeluxe.in/uploads/${product.images[0]}`}
                    alt={product.name}
                    className="mb-2 rounded-xl object-contain w-max h-40 mx-auto"
                    onError={(e) => (e.target.src = '/fallback-image.png')}
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

      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center !text-[#D1B23E]" 
          onClick={() => navigate('/')}
        >
          <Home size={24} />
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center !text-[#D1B23E]" 
          onClick={() => navigate('/brands')}
        >
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
