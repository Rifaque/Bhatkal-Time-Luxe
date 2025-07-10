// hooks/useProductPageLogic.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

export default function useProductPageLogic() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  // Fetch product
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

  // Clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentImage((prev) =>
        prev === product?.images.length - 1 ? 0 : prev + 1
      ),
    onSwipedRight: () =>
      setCurrentImage((prev) =>
        prev === 0 ? product?.images.length - 1 : prev - 1
      ),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

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
      const response = await axios.get(
        `https://api.bhatkaltimeluxe.in/api/product/${productId}/checkout`
      );

      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }

      navigate('/order-confirmation', {
        state: {
          orderId: response.data.orderId,
          total: response.data.total,
          message: response.data.message,
        },
      });
    } catch (err) {
      setNotification('Failed to complete purchase');
      console.error('Buy now error:', err);
    }
  };

  return {
    product,
    loading,
    error,
    notification,
    setNotification,
    currentImage,
    setCurrentImage,
    swipeHandlers,
    buyNow,
    navigate,
    // addToCart,
  };
}
