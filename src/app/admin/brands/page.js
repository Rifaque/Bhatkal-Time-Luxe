'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getImageUrl } from '@/lib/image';

export default function BrandsManager() {
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands');
      setBrands(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !logo) {
      setError('Please provide both a name and logo');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('logo', logo);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/brands', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Brand added successfully!');
      setName('');
      setLogo(null);
      
      // Clear file input value
      const fileInput = document.getElementById('logo-file-input');
      if (fileInput) fileInput.value = '';

      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add brand');
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Brand deleted successfully!');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete brand');
    }
  };

  return (
    <div className="p-4 !bg-[#2A2A2A] text-white min-h-screen relative pb-16">
      <h2 className="text-2xl font-bold mb-4">Manage Brands</h2>

      {error && <p className="mb-2 text-red-500">{error}</p>}
      {success && <p className="mb-2 text-green-500">{success}</p>}

      {/* Form to add a new brand */}
      <form onSubmit={handleAddBrand} className="mb-6 !bg-[#1e1e1e] p-4 rounded-lg shadow max-w-lg">
        <h3 className="text-xl font-semibold mb-2">Add New Brand</h3>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-1">Brand Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
            placeholder="Brand name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-1">Brand Logo</label>
          <input 
            id="logo-file-input"
            type="file" 
            onChange={(e) => setLogo(e.target.files[0])}
            className="w-full p-2 !bg-[#494949] text-white focus:outline-none"
            accept="image/*"
            required
          />
        </div>
        <button 
          type="submit"
          className="w-full py-2 bg-[#D1B23E] text-black rounded-full font-bold hover:bg-[#c1a22e] transition"
        >
          Add Brand
        </button>
      </form>

      {/* List of brands */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div key={brand._id} className="!bg-[#1e1e1e] p-4 rounded-lg shadow flex flex-col items-center">
            <img
              src={getImageUrl(brand.logo, 'brand')}
              alt={brand.name}
              className="w-24 h-24 object-cover rounded mb-2 bg-[#EDEDED]"
              onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
            />
            <h3 className="text-lg font-semibold">{brand.name}</h3>
            <button
              onClick={() => handleDeleteBrand(brand._id)}
              className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition font-semibold"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Floating Back Button */}
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
