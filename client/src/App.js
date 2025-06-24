import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AdminPanel from './admin/AdminPanel';
import Homepage from './pages/Home';
import ProductPage from './pages/ProductPage';
import BrandsPage from './pages/BrandsPage';
import BrandDetailsPage from './pages/BrandDetailsPage';
import NewArrivals from './pages/NewArrivals';
import Contact from './pages/Contact';
import CartPage from './pages/CartPage';
import OrderConfirmation from './pages/OrderConfirmation';
import SearchPage from './pages/SearchPage';
import FAQ from './pages/FAQ';

const router = createBrowserRouter(
  [
    { path: '/', element: <Homepage /> },
    { path: '/search', element: <SearchPage /> },
    { path: '/product/:id', element: <ProductPage /> },
    { path: '/brands', element: <BrandsPage /> },
    { path: '/brands/:id', element: <BrandDetailsPage /> },
    { path: '/new-arrivals', element: <NewArrivals /> },
    { path: '/contact', element: <Contact /> },
    { path: '/faq', element: <FAQ /> },
    { path: '/cart', element: <CartPage /> },
    { path: '/order-confirmation', element: <OrderConfirmation /> },
    { path: '/admin/*', element: <AdminPanel /> },
    { path: '/login', element: <Navigate to="/admin/login" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
