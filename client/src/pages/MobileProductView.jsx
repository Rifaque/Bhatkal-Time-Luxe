import useProductPageLogic from '../hooks/useProductPageLogic';
import Loader from '../components/Loader';
import { Button } from '../components/ui/button';



export default function MobileProductView() {
  const {
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
  } = useProductPageLogic();


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
                src={`https://hz-btl.imgix.net/${product.images[currentImage]}`}
                alt={product.name}
                className="mt-14 h-[36vh] object-contain mx-auto rounded-2xl"
                onError={(e) => (e.currentTarget.src = '/fallback-image.webp')}
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