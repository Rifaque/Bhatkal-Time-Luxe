import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home, Tag, ShoppingCart, Clock } from 'lucide-react';
import axios from 'axios';
import Loader from '../components/Loader';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cart items
    const fetchCart = async () => {
      try {
        const cartResponse = await axios.get('https://api.bhatkaltimeluxe.in/api/cart');
        setCartItems(cartResponse.data.items || []);

        const totalResponse = await axios.get('https://api.bhatkaltimeluxe.in/api/cart/total');
        setTotal(totalResponse.data.total);
        setLoading(false); 
      } catch (error) {
        console.error('Failed to fetch cart', error);
      }
    };

    fetchCart();
  }, []);

  // If still loading, show the loader
  if (loading) {
    return (
      <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.put(`https://api.bhatkaltimeluxe.in/api/cart/${productId}`, { quantity: newQuantity });
      
      // Refetch cart to update
      const cartResponse = await axios.get('https://api.bhatkaltimeluxe.in/api/cart');
      setCartItems(cartResponse.data.items || []);

      const totalResponse = await axios.get('https://api.bhatkaltimeluxe.in/api/cart/total');
      setTotal(totalResponse.data.total);
    } catch (error) {
      console.error('Failed to update cart', error);
    }
  };

  const checkout = async () => {
    try {
      const response = await axios.get('https://api.bhatkaltimeluxe.in/api/cart/checkout');
      
      // Optional: Open WhatsApp if URL is available
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }

      // Navigate to order confirmation or show success message
      navigate('/order-confirmation', { 
        state: { 
          orderId: response.data.orderId, 
          total: response.data.total 
        } 
      });
    } catch (error) {
      console.error('Checkout failed', error);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Main Content */}
      <div className="!bg-[#2A2A2A] text-white min-h-screen pb-16 filter blur-sm">
        <header className="p-4 text-center">
          <h1 className="text-xl font-semibold">My Cart</h1>
        </header>

        <section className="p-4 space-y-4">
          {cartItems.map((item) => (
            <Card 
              key={item.product._id} 
              className="!bg-[#1E1E1E] text-white rounded-2xl"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://api.bhatkaltimeluxe.in/uploads/${item.product.images[0]}`}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => (e.target.src = '/fallback-image.png')}
                  />
                  <div>
                    <h3 className="text-sm font-semibold">{item.product.name}</h3>
                    <p className="text-sm">Colour: {item.product.color}</p>
                    <p className="text-sm">&#8377; {new Intl.NumberFormat('en-IN').format(item.product.price)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="!bg-[#333] text-white"
                    onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </Button>
                  <span>{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="!bg-[#333] text-white"
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="p-4 fixed bottom-20 left-4 right-4 bg-[#1E1E1E] rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Total</h2>
            <p className="text-xl font-bold">&#8377; {new Intl.NumberFormat('en-IN').format(total)}</p>
          </div>
          <Button 
            onClick={checkout}
            className="w-full !bg-[#D1B23E] text-black font-semibold py-3 rounded-2xl"
          >
            Buy Now
          </Button>
        </section>
      </div>

      {/* Overlay covering only the main content */}
      <div className="absolute top-0 left-0 right-0 bottom-14 flex flex-col items-center justify-center z-10 bg-black bg-opacity-50">
        <Clock size={64} className="mb-4 text-white" />
        <h1 className="text-3xl font-bold text-white mb-2">Coming Soon</h1>
        <p className="text-white mb-8 text-center max-w-xs">
          Our cart functionality is currently under development. Please check back later!
        </p>
        <Button 
          onClick={() => navigate('/')} 
          className="!bg-[#D1B23E] text-black font-semibold py-3 px-6 rounded-2xl"
        >
          Go Back Home
        </Button>
      </div>

      {/* Bottom Navigation remains visible */}
      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2 z-20">
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]" onClick={() => navigate('/')}>
          <Home size={24} />
        </Button>
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]" onClick={() => navigate('/brands')}>
          <Tag size={24} /> 
        </Button>
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]">
          <ShoppingCart size={24} />
        </Button>
      </nav>
    </div>
  );
}
