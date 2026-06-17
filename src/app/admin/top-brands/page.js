'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Select from 'react-select';

export default function TopBrandsManager() {
  const router = useRouter();
  const [topBrands, setTopBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTopBrands();
    fetchBrands();
  }, []);

  const fetchTopBrands = async () => {
    try {
      const res = await axios.get('/api/top-brands');
      setTopBrands(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load top brands');
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands');
      const sortedBrands = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(sortedBrands);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  };

  const handleAddTopBrand = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedBrand) {
      setError('Please select a brand');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        '/api/admin/top-brands',
        { brandId: selectedBrand.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Top brand added successfully!');
      setSelectedBrand(null);
      fetchTopBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add top brand');
    }
  };

  const handleDeleteTopBrand = async (brandId) => {
    if (!window.confirm('Are you sure you want to remove this top brand?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/top-brands/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Top brand removed successfully!');
      fetchTopBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove top brand');
    }
  };

  const brandOptions = brands.map((brand) => ({
    value: brand._id,
    label: brand.name,
  }));

  return (
    <div className="p-4 bg-[#2A2A2A] text-white min-h-screen relative pb-16">
      <h2 className="text-2xl font-bold mb-4">Manage Top Brands</h2>
      {error && <p className="mb-2 text-red-500">{error}</p>}
      {success && <p className="mb-2 text-green-500">{success}</p>}
      
      <form onSubmit={handleAddTopBrand} className="mb-6 bg-[#1e1e1e] p-4 rounded-lg shadow max-w-lg">
        <h3 className="text-xl font-semibold mb-2">Add New Top Brand</h3>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-1">Select Brand</label>
          <Select 
            options={brandOptions} 
            value={selectedBrand} 
            onChange={setSelectedBrand} 
            placeholder="Select a brand..."
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
          Add Top Brand
        </button>
      </form>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {topBrands.map((item) => {
          if (!item.brand) return null;

          return (
            <div key={item._id} className="bg-[#1e1e1e] p-4 rounded-lg shadow flex flex-col items-center">
              <p className="text-lg font-semibold text-center">{item.brand.name}</p>
              <button
                onClick={() => handleDeleteTopBrand(item.brand._id)}
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
