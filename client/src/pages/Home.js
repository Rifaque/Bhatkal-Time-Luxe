import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home, ShoppingCart, Menu, Search, Tag } from 'lucide-react';
import btimehome from '../assets/images/btimehome.webp';
import Loader from '../components/Loader';
import HamburgerMenu from '../components/HamburgerMenu';
import { FaWhatsapp } from 'react-icons/fa';

export default function Homepage() {
  const [topCategories, setTopCategories] = useState([]); // now topCategories from top-brands
  const [allProducts, setAllProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const newArrivalsRef = useRef(null);
  const featuredRef = useRef(null);
  const bestSellingRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(12);

  // Fetch data from endpoints.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top categories (from top-brands)
        const topCatRes = await fetch('https://api.bhatkaltimeluxe.in/api/top-brands');
        const topCatData = await topCatRes.json();
        setTopCategories(topCatData);

        // Fetch all products
        const productsRes = await fetch('https://api.bhatkaltimeluxe.in/api/products');
        const productsData = await productsRes.json();
        setAllProducts(productsData);

        // Fetch featured items (populated with product details)
        const featuredRes = await fetch('https://api.bhatkaltimeluxe.in/api/featured');
        const featuredData = await featuredRes.json();
        setFeatured(featuredData);

        // Fetch best-selling items (populated with product details)
        const bestSellingRes = await fetch('https://api.bhatkaltimeluxe.in/api/best-selling');
        const bestSellingData = await bestSellingRes.json();
        setBestSelling(bestSellingData);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set the number of items to show based on the window width.
  useEffect(() => {
    const updateItemsToShow = () => {
      const width = window.innerWidth;
      if (width >= 1536) { // 2xl breakpoint
        setItemsToShow(16);
      } else if (width >= 1280) { // xl breakpoint
        setItemsToShow(16);
      } else if (width >= 1024) { // lg breakpoint
        setItemsToShow(16);
      } else if (width >= 768) { // md breakpoint
        setItemsToShow(16);
      } else {
        setItemsToShow(12);
      }
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  // Compute two random products for the top tiles using allProducts.
  const randomProduct1 = useMemo(() => {
    return allProducts.length ? allProducts[Math.floor(Math.random() * allProducts.length)] : null;
  }, [allProducts]);

  const randomProduct2 = useMemo(() => {
    return allProducts.length ? allProducts[Math.floor(Math.random() * allProducts.length)] : null;
  }, [allProducts]);

  // Extract full product details from the populated featured and best-selling arrays.
  const featuredProducts = useMemo(() => {
    return featured.map(item => item.productId).filter(Boolean);
  }, [featured]);

  const bestSellingProducts = useMemo(() => {
    return bestSelling.map(item => item.productId).filter(Boolean);
  }, [bestSelling]);

  // If still loading, show the loader.
  if (loading) {
    return (
      <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Handlers to scroll to specific sections.
  const scrollToNewArrivals = () => {
    newArrivalsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to render an image with fallback.
  const renderImage = (product) => {
    const imageSrc = product.images?.[0] || product.image || 'fallback-image.webp';
    return (
      <img
        src={`https://hz-btl.imgix.net/${imageSrc}`}
        alt={product.name}
        className="mb-2 rounded-xl object-contain w-full h-40"
        onError={(e) => (e.target.src = '../assets/images/fallback-image.webp')}
        loading="lazy"
      />
    );
  };

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

      {/* Greeting */}
      <section className="p-4">
        <h1 className="text-xl font-semibold">Hello There! 👋</h1>
        <p className="text-sm text-gray-400">Let's start shopping!!</p>
      </section>

      {/* Top Tiles */}
      <section className="p-4 pl-0 pr-0">
        <div className="flex gap-4 overflow-x-scroll scrollbar-hide">
          {/* Tile 1: Scrolls to Best Selling */}
          <div className="!bg-[#ededed] ml-4 rounded-xl p-3 min-w-[300px]">
            <div className="flex items-center">
              <div className="flex-1">
                <h2 className="text-[#4e4e4e] text-base font-bold">
                  Shop The Best From Our Collection
                </h2>
                <Button 
                  className="mt-2 text-white !bg-[#777777] rounded-[20px]"
                  onClick={scrollToFeatured}
                >
                  Get Now
                </Button>
              </div>
              <div className="w-24 h-24 ml-2">
                {randomProduct1 && (
                  <img
                    src={`https://hz-btl.imgix.net/${randomProduct1.images?.[0] || 'fallback-image.webp'}`}
                    alt={randomProduct1.name}
                    className="object-contain rounded-xl w-full h-full"
                    onError={(e) => (e.target.src = '/fallback-image.webp')}
                  />
                )}
              </div>
            </div>
          </div>
          {/* Tile 2: Scrolls to New Arrivals */}
          <div className="!bg-[#494949] mr-4 rounded-xl p-3 min-w-[300px]">
            <div className="flex items-center">
              <div className="flex-1">
                <h2 className="text-base font-semibold">
                  Want Something To Gift Your Friends?
                </h2>
                <Button 
                  className="mt-2 text-black !bg-[#9a9a9a] rounded-[20px]"
                  onClick={scrollToNewArrivals}
                >
                  Get Now
                </Button>
              </div>
              <div className="w-24 h-24 ml-2">
                {randomProduct2 && (
                  <img
                    src={`https://hz-btl.imgix.net/${randomProduct2.images?.[0] || 'fallback-image.webp'}`}
                    alt={randomProduct2.name}
                    className="object-contain rounded-xl w-full h-full"
                    onError={(e) => (e.target.src = '/fallback-image.webp')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Top Categories</h2>
          <a href="/brands" className="text-[#D1B23E] text-sm font-medium">See All</a>
        </div>

        <div className="flex gap-2 overflow-x-scroll scrollbar-hide">
          {topCategories.map((item) => (
            <div 
              key={item._id}
              className="cursor-pointer "
              onClick={() => navigate(`/brands/${item.brand._id}`)}
            >
              <Card className="!bg-[#1E1E1E] w-24 h-24 flex justify-center items-center overflow-hidden rounded-xl shadow-md">
                <CardContent className="w-full h-full flex items-center justify-center p-2 rounded-lg bg-[#2A2A2A]">
                  <div className="w-full h-full bg-[#EDEDED] rounded-md flex items-center justify-center">
                    <img
                      src={`https://hz-btl.imgix.net/${item.brand.logo}`}
                      alt={item.brand.name}
                      className="max-h-full object-contain mix-blend-multiply"
                      onError={(e) => (e.target.src = '/fallback-brand.png')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>


      {/* Featured Products Section (Horizontal Scroll) */}
      <section ref={featuredRef} className="p-4">
        <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
        {featuredProducts.length > 0 ? (
          <div className="flex gap-4 overflow-x-scroll scrollbar-hide">
            {featuredProducts.map((product) => (
              <div 
                key={product._id}
                className="w-[42vw] md:w-[200px] cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <Card className="p-4 !bg-[#EDEDED] rounded-2xl">
                  <div className="relative">
                    {product.MRP && product.price && product.MRP > product.price && (
                      <span className="absolute top-2 left-2 bg-[#D1B23E] text-black px-2 py-1 text-xs rounded">
                        {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                      </span>
                    )}
                    {renderImage(product)}
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
        ) : (
          <p>No featured products available.</p>
        )}
      </section>

      {/* Best Selling Products Section (Horizontal Scroll) */}
      <section ref={bestSellingRef} className="p-4">
        <h2 className="text-xl font-semibold mb-4">Best Selling Products</h2>
        {bestSellingProducts.length > 0 ? (
          <div className="flex gap-4 overflow-x-scroll scrollbar-hide">
            {bestSellingProducts.map((product) => (
              <div 
                key={product._id}
                className="w-[42vw] md:w-[200px] cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <Card className="p-4 !bg-[#EDEDED] rounded-2xl">
                  <div className="relative">
                    {product.MRP && product.price && product.MRP > product.price && (
                      <span className="absolute top-2 left-2 bg-[#D1B23E] text-black px-2 py-1 text-xs rounded">
                        {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                      </span>
                    )}
                    {renderImage(product)}
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
        ) : (
          <p>No best selling products available.</p>
        )}
      </section>

      {/* New Arrivals Section */}
      <section ref={newArrivalsRef} className="p-4">
        <h2 className="text-xl font-semibold mb-4">New Arrivals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {allProducts.slice(0, itemsToShow).map((product) => (
            <div 
              key={product._id}
              className="cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <Card className="p-4 !bg-[#EDEDED] rounded-2xl">
                <div className="relative">
                  {product.MRP && product.price && product.MRP > product.price && (
                    <span className="absolute top-2 left-2 bg-[#D1B23E] text-black px-2 py-1 text-xs rounded">
                      {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                    </span>
                  )}
                  {renderImage(product)}
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
            href="https://www.hubzero.in" 
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
        href="https://wa.me/918050858500"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-3 z-50 bg-[#1e1e1e] p-4 rounded-full shadow-lg"
      >
        <FaWhatsapp size={24} style={{ color: "#D1B23E" }} />
      </a>

      {/* Navigation */}
      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2">
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]">
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
