'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Select from 'react-select';

export default function FeaturedManager() {
  const router = useRouter();
  const [featured, setFeatured] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFeatured();
    fetchProducts();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get('/api/featured');
      setFeatured(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load featured items');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      const sortedProducts = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(sortedProducts);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    }
  };

  const handleAddFeatured = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        '/api/admin/featured',
        { productId: selectedProduct.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Featured product added successfully!');
      setSelectedProduct(null);
      fetchFeatured();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add featured product');
    }
  };

  const handleDeleteFeatured = async (id) => {
    if (!window.confirm('Are you sure you want to remove this featured product?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/featured/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Featured product removed successfully!');
      fetchFeatured();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove featured product');
    }
  };

  const productOptions = products.map((product) => ({
    value: product._id,
    label: product.name,
  }));

  return (
    <div className="p-4 !bg-[#2A2A2A] text-white min-h-screen relative pb-16">
      <h2 className="text-2xl font-bold mb-4">Manage Featured Products</h2>
      {error && <p className="mb-2 text-red-500">{error}</p>}
      {success && <p className="mb-2 text-green-500">{success}</p>}
      
      <form onSubmit={handleAddFeatured} className="mb-6 !bg-[#1e1e1e] p-4 rounded-lg shadow max-w-lg">
        <h3 className="text-xl font-semibold mb-2">Add New Featured Product</h3>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-1">Select Product</label>
          <Select 
            options={productOptions} 
            value={selectedProduct} 
            onChange={setSelectedProduct} 
            placeholder="Select a product..."
            isSearchable
            className="text-black"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: '#494949',
                borderColor: '#494949',
                color: 'white',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'white',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: '#494949',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#333333' : '#494949',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#5a5a5a',
                },
              }),
            }}
          />
        </div>
        <button 
          type="submit"
          className="w-full py-2 bg-[#D1B23E] text-black rounded-full font-bold hover:bg-[#c1a22e] transition"
        >
          Add Featured
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {featured.map((item) => {
          if (!item.productId) return null;

          return (
            <div key={item._id} className="!bg-[#1e1e1e] p-4 rounded-lg shadow flex flex-col items-center">
              <p className="text-lg font-semibold text-center">{item.productId.name}</p>
              <button
                onClick={() =>
                  handleDeleteFeatured(
                    typeof item.productId === 'object' ? item.productId._id : item.productId
                  )
                }
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition font-semibold"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="px-4 py-2 bg-[#D1B23E] text-black rounded-full shadow-lg hover:bg-[#c1a22e] transition font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
