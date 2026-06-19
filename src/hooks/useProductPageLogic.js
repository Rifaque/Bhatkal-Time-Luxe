import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import { useCurrency } from '@/context/CurrencyContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function useProductPageLogic() {
  const params    = useParams();
  const productId = params?.id;
  const router    = useRouter();
  const { currency } = useCurrency();
  const { whatsappNumber } = useStoreSettings();

  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [notification, setNotification] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [buyingNow,    setBuyingNow]    = useState(false);

  useEffect(() => {
    if (!productId) return;
    axios
      .get(`/api/products/${productId}`)
      .then((res) => { setProduct(res.data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.error || 'Product not found'); setLoading(false); });
  }, [productId]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(''), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft:  () => setCurrentImage((p) => (p === (product?.images?.length ?? 1) - 1 ? 0 : p + 1)),
    onSwipedRight: () => setCurrentImage((p) => (p === 0 ? (product?.images?.length ?? 1) - 1 : p - 1)),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const buyNow = async () => {
    if (buyingNow) return;
    setBuyingNow(true);
    try {
      const response = await axios.post(
        `/api/product/${productId}/checkout`,
        { currency }
      );

      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }
      router.push(
        `/order-confirmation?orderId=${response.data.orderId}&total=${response.data.total}`
      );
    } catch (err) {
      setNotification('Failed to complete purchase. Please try again.');
      console.error('Buy now error:', err.response?.data || err.message);
    } finally {
      setBuyingNow(false);
    }
  };

  const openRequestDetails = () => {
    if (!product) return;
    const refLabel = product.reference ? ` (${product.reference})` : '';
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    const url = configuredOrigin ? configuredOrigin + window.location.pathname : window.location.href;
    const text = `Hello, I'm interested in the ${product.name}${refLabel} from Bhatkal Time Luxe. Could you please share more details?\n\n${url}`;
    const wa = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}` : '/contact';
    window.open(wa, '_blank', 'noopener,noreferrer');
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
    buyingNow,
    openRequestDetails,
    router,
  };
}
