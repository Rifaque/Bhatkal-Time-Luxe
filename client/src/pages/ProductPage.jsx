import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { useSwipeable } from 'react-swipeable';
import Loader from '../components/Loader';

export default function ProductPage() {
  const { id: productId } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [notification, setNotification] = useState('');
  

  useEffect(() => {
    if (productId) {
      axios
        .get(`https://api.bhatkaltimeluxe.in/api/products/${productId}`)
        .then((response) => {
          setProduct(response.data);
          setLoading(false); 
        })
        .catch((err) => {
          setError(err.response?.data?.error || 'Failed to load product');
        });
    }
  }, [productId]);



  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setCurrentImage((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    },
    onSwipedRight: () => {
      setCurrentImage((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

      // If still loading, show the loader
      if (loading) {
        return (
          <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
            <Loader />
          </div>
        );
      }

  // const addToCart = async () => {
  //   try {
  //     await axios.post('https://api.bhatkaltimeluxe.in/api/cart', {
  //       product: productId,
  //     });
      
  //     setNotification('Added to cart successfully!');
  //   } catch (err) {
  //     setNotification('Failed to add to cart');
  //     console.error('Add to cart error:', err);
  //   }
  // };

  const buyNow = async () => {
    try {
      // Direct purchase by calling the new checkout endpoint for the specific product
      const response = await axios.get(`https://api.bhatkaltimeluxe.in/api/product/${productId}/checkout`);
      
      // Optionally, you can use the response data to show a confirmation message
      // or navigate to an order confirmation page.
      // Here we'll check if there's a WhatsApp order link and open it:
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }
      
      // Optionally, navigate to a confirmation page and pass order details:
      navigate('/order-confirmation', { 
        state: { 
          orderId: response.data.orderId, 
          total: response.data.total,
          message: response.data.message
        } 
      });
      
    } catch (err) {
      setNotification('Failed to complete purchase');
      console.error('Buy now error:', err);
    }
  };

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!product) return <p className="p-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#ededed] relative flex flex-col">
      {/* Notification */}
      {notification && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#323232] text-white text-center py-2">
          {notification}
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        {/* Product Image Container */}
        <div
          {...swipeHandlers}
          className="relative h-[50vh] w-full max-w-md mx-auto"
        >
          {/* Discount Badge */}
          {product.MRP && product.price && product.MRP > product.price && (
            <span className="absolute top-5 right-5 !bg-[#D1B23E] text-black px-2 py-1 text-xs rounded">
              {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
            </span>
          )}
          <img
            src={`https://api.bhatkaltimeluxe.in/uploads/${product.images[currentImage]}`}
            alt={product.name}
            className="mt-14 h-[36vh] object-contain mx-auto rounded-2xl"
            onError={(e) => (e.currentTarget.src = '/fallback-image.png')}
          />
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full ${
                  currentImage === index ? 'bg-[#cca326]' : 'bg-gray-300'
                }`}
              ></button>
            ))}
          </div>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 text-4xl/6 left-4 bg-white bg-opacity-50 rounded-full pb-4 p-2"
          >
            &#8592;
          </button>
        </div>

        {/* Product Details */}
        <div className="w-full max-w-md mx-auto bg-[#323232] text-gray-300 p-4 flex-grow">
          <h2 className="text-2xl mt-4 ">{product.name}</h2>
          <div className="flex items-center justify-between mt-6">
            <div
              className="flex items-center space-x-2"
              style={{ fontFamily: 'Sebino Extra Bold, sans-serif' }}
            >
              <p className="text-xl font-semibold text-white">
                &#8377; {new Intl.NumberFormat('en-IN').format(product.price)}
              </p>
              <p className="text-sm text-gray-400 line-through">
                &#8377; {new Intl.NumberFormat('en-IN').format(product.MRP)}
              </p>
            </div>
            <p
              className={`text-sm font-medium ${
                product.inStock ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {product.inStock ? 'Available in stock' : 'Out of Stock'}
            </p>
          </div>
          <h3 className="mt-6 text-lg font-semibold text-white">About</h3>
          <p className="mt-1 text-[#cccccc]">{product.about}</p>
          <div className="mt-4 h-32"></div>
        </div>
      </div>

      {/* Floating Sticky Bottom Buttons */}
      <div className="fixed bottom-8 left-4 right-4 z-50 flex justify-center">
        <div className="flex space-x-4 max-w-md w-full px-4">
          {/* <Button
            onClick={addToCart}
            disabled={!product.inStock}
            className="!bg-[#cca326] text-white flex-1 rounded-[10px]"
          >
            Add to Cart
          </Button> */}
          <Button
            onClick={buyNow}
            disabled={!product.inStock}
            className="!bg-[#cca326] text-white flex-1 rounded-[10px]"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
