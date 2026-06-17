// hooks/useProductPageLogic.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';

export default function useProductPageLogic() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  // Fetch product
  useEffect(() => {
    if (productId) {
      axios
        .get(`/api/products/${productId}`)
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

  const buyNow = async () => {
    try {
      const response = await axios.get(
        `/api/product/${productId}/checkout`
      );

      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }

      router.push(`/order-confirmation?orderId=${response.data.orderId}&total=${response.data.total}`);
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
    router,
  };
}
