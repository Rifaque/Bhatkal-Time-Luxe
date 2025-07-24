import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BrandsManager from './BrandsManager'; 
import ProductsManager from './ProductManager';
import FeaturedManager from './FeaturedManager';
import BestSellingManager from './BestSellingManager';
import TopBrandsManager from './TopBrandsManager';
import AdminLogs from "./components/AdminLogs";

// Admin Login Component
function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://api.bhatkaltimeluxe.in/api/admin/login', { username, password });
      const token = res.data.token;
      localStorage.setItem('adminToken', token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#2A2A2A]">
      <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl text-white font-bold mb-4 text-center">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-[#494949] text-white focus:outline-none"
              placeholder="Username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-[#494949] text-white focus:outline-none"
              placeholder="Password"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 bg-[#D1B23E] text-black rounded-full font-bold hover:bg-[#c1a22e] transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

// Admin Dashboard Component
function AdminDashboard() {
  const navigate = useNavigate();
  const [brandCount, setBrandCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [bestSellingCount, setBestSellingCount] = useState(0);
  const [topBrandsCount, setTopBrandsCount] = useState(0);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [cleanupError, setCleanupError] = useState(null);
  const [cleanupDisabled, setCleanupDisabled] = useState(false);

  // Fetch counts on mount
  useEffect(() => {
    async function fetchCounts() {
      try {
        const resBrands = await axios.get('https://api.bhatkaltimeluxe.in/api/brands');
        setBrandCount(resBrands.data.length);

        const resProducts = await axios.get('https://api.bhatkaltimeluxe.in/api/products');
        setProductCount(resProducts.data.length);

        const resFeatured = await axios.get('https://api.bhatkaltimeluxe.in/api/featured');
        setFeaturedCount(resFeatured.data.length);

        const resBestSelling = await axios.get('https://api.bhatkaltimeluxe.in/api/best-selling');
        setBestSellingCount(resBestSelling.data.length);

        const resTopBrands = await axios.get('https://api.bhatkaltimeluxe.in/api/top-brands');
        setTopBrandsCount(resTopBrands.data.length);
      } catch (err) {
        console.error('Failed to fetch counts', err);
      }
    }
    fetchCounts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Cleanup images handler with 30-second cooldown
  const handleCleanupImages = async () => {
    setCleanupResult(null);
    setCleanupError(null);
    const token = localStorage.getItem('adminToken');

    // Disable the button immediately
    setCleanupDisabled(true);

    try {
      const res = await axios.post(
        'https://api.bhatkaltimeluxe.in/api/admin/cleanup-images',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCleanupResult(res.data);
    } catch (err) {
      console.error("Cleanup error:", err);
      setCleanupError(err.response?.data?.error || "Cleanup failed");
    } finally {
      // Re-enable the button after 30 seconds
      setTimeout(() => {
        setCleanupDisabled(false);
      }, 30000);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A2A2A] text-white">
      <header className="flex justify-between items-center p-4 bg-[#1e1e1e]">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={handleLogout} 
          className="bg-[#D1B23E] text-black px-4 py-2 rounded-full hover:bg-[#c1a22e] transition"
        >
          Logout
        </button>
      </header>
      <main className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Welcome, Admin!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brands Card */}
          <DashboardCard title="Brands" count={brandCount} onClick={() => navigate('/admin/brands')} />
          {/* Products Card */}
          <DashboardCard title="Products" count={productCount} onClick={() => navigate('/admin/products')} />
          {/* Featured Items Card */}
          <DashboardCard title="Featured Items" count={featuredCount} onClick={() => navigate('/admin/featured')} />
          {/* Best-Selling Items Card */}
          <DashboardCard title="Best-Selling Items" count={bestSellingCount} onClick={() => navigate('/admin/best-selling')} />
          {/* Top Brands Card */}
          <DashboardCard title="Top Brands" count={topBrandsCount} onClick={() => navigate('/admin/top-brands')} />
          {/* Cleanup Images Card */}
          <div className="bg-[#1e1e1e] p-4 rounded-lg shadow flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2">Cleanup Orphaned Images</h3>
            <button 
              onClick={handleCleanupImages}
              disabled={cleanupDisabled}
              className={`mt-2 px-4 py-1 rounded-full transition ${
                cleanupDisabled
                  ? 'bg-gray-500 text-gray-200 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {cleanupDisabled ? 'Please wait...' : 'Cleanup Images'}
            </button>
            {cleanupResult && (
              <div className="mt-2 text-center">
                <p className="text-sm">Deleted Files: {cleanupResult.deletedFiles.join(', ')}</p>
                <p className="text-sm">Total Deleted: {cleanupResult.count}</p>
              </div>
            )}
            {cleanupError && (
              <div className="mt-2 text-center text-red-400">
                <p className="text-sm">{cleanupError}</p>
              </div>
            )}
          </div>
          {/* Floating Back Button */}
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-[#D1B23E] text-black rounded-full shadow-lg hover:bg-[#c1a22e] transition"
            >
              Homepage
            </button>
          </div>
        </div>
        <AdminLogs />
      </main>
    </div>
  );
}

function DashboardCard({ title, count, onClick }) {
  return (
    <div className="bg-[#1e1e1e] p-4 rounded-lg shadow flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{count}</p>
      <button onClick={onClick} className="mt-2 px-4 py-1 bg-[#D1B23E] text-black rounded-full hover:bg-[#c1a22e] transition">
        Manage {title}
      </button>
    </div>
  );
}

// Main Admin Panel Routes (without BrowserRouter)
export default function AdminPanel() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="brands" 
        element={
          <ProtectedRoute>
            <BrandsManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="products" 
        element={
          <ProtectedRoute>
            <ProductsManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="featured" 
        element={
          <ProtectedRoute>
            <FeaturedManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="best-selling" 
        element={
          <ProtectedRoute>
            <BestSellingManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="top-brands" 
        element={
          <ProtectedRoute>
            <TopBrandsManager />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
}
