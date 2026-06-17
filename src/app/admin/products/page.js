'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getImageUrl } from '@/lib/image';

export default function ProductsManager() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // State for adding new product
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [MRP, setMRP] = useState('');
  const [price, setPrice] = useState('');
  const [inStock, setInStock] = useState(true);
  const [color, setColor] = useState('');
  const [about, setAbout] = useState('');
  const [images, setImages] = useState([]);
  
  // Feedback state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    brand: '',
    MRP: '',
    price: '',
    inStock: true,
    color: '',
    about: ''
  });
  const [updateImages, setUpdateImages] = useState(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    }
  }, []);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/brands');
      setBrands(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  }, []);

  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [fetchProducts, fetchBrands]);

  // Set default brand select option
  useEffect(() => {
    if (brands.length > 0 && !brand) {
      setBrand(brands[0]._id);
    }
  }, [brands, brand]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !brand || !MRP || !price || images.length === 0) {
      setError('Please fill in all required fields and upload at least one image.');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('MRP', MRP);
    formData.append('price', price);
    formData.append('inStock', inStock);
    formData.append('color', color);
    formData.append('about', about);
    
    Array.from(images).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Product added successfully!');
      setName('');
      setBrand(brands.length > 0 ? brands[0]._id : '');
      setMRP('');
      setPrice('');
      setInStock(true);
      setColor('');
      setAbout('');
      setImages([]);

      // Reset file input
      const fileInput = document.getElementById('product-images-input');
      if (fileInput) fileInput.value = '';

      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const openUpdateModal = (product) => {
    setProductToUpdate(product);
    setUpdateData({
      name: product.name,
      brand: product.brand,
      MRP: product.MRP,
      price: product.price,
      inStock: product.inStock,
      color: product.color,
      about: product.about
    });
    setUpdateImages(null);
    setUpdateModalOpen(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      
      if (updateImages && updateImages.length > 0) {
        const formData = new FormData();
        formData.append('name', updateData.name);
        formData.append('brand', updateData.brand);
        formData.append('MRP', updateData.MRP);
        formData.append('price', updateData.price);
        formData.append('inStock', updateData.inStock);
        formData.append('color', updateData.color);
        formData.append('about', updateData.about);
        Array.from(updateImages).forEach((file) => {
          formData.append('images', file);
        });

        await axios.put(`/api/products/${productToUpdate._id}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.put(`/api/products/${productToUpdate._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setSuccess('Product updated successfully!');
      setUpdateModalOpen(false);
      setProductToUpdate(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
    }
  };

  return (
    <div className="p-4 !bg-[#2A2A2A] text-white min-h-screen relative pb-16">
      <h2 className="text-2xl font-bold mb-4">Manage Products</h2>

      {error && <p className="mb-2 text-red-500">{error}</p>}
      {success && <p className="mb-2 text-green-500">{success}</p>}

      {/* Form to add a new product */}
      <form onSubmit={handleAddProduct} className="mb-6 !bg-[#1e1e1e] p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Add New Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Product Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
              required
            >
              {brands
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">MRP</label>
            <input 
              type="number"
              value={MRP}
              onChange={(e) => setMRP(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Price</label>
            <input 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Color</label>
            <input 
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">In Stock</label>
            <select
              value={inStock}
              onChange={(e) => setInStock(e.target.value === 'true')}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm mb-1">About</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm mb-1">Product Images</label>
            <input 
              id="product-images-input"
              type="file"
              multiple
              onChange={(e) => setImages(e.target.files)}
              className="w-full p-2 !bg-[#1e1e1e] text-white focus:outline-none"
              accept="image/*"
              required
            />
          </div>
        </div>
        <button 
          type="submit"
          className="mt-4 w-full py-2 bg-[#D1B23E] text-black rounded-full font-bold hover:bg-[#c1a22e] transition"
        >
          Add Product
        </button>
      </form>

      {/* Grid List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedProducts.map((product) => {
          const decodedBrand = brands.find(b => b._id === product.brand);
          return (
            <div key={product._id} className="!bg-[#191919] p-4 rounded-lg shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-2">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="w-16 h-16 object-contain rounded mr-2 bg-white"
                      onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                    />
                  )}
                  <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                </div>
                <p className="text-xs text-gray-400">
                  Brand: {decodedBrand ? decodedBrand.name : product.brand}
                </p>
                <p className="text-sm">MRP: &#8377; {product.MRP}</p>
                <p className="text-sm font-bold text-[#D1B23E]">Price: &#8377; {product.price}</p>
                <p className="text-xs text-gray-400">Color: {product.color}</p>
                <p className="text-xs text-gray-400">In Stock: {product.inStock ? 'Yes' : 'No'}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleDeleteProduct(product._id)}
                  className="flex-1 py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <button 
                  onClick={() => openUpdateModal(product)}
                  className="flex-1 py-1 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
                >
                  Update
                </button>
              </div>
            </div>
          );
        })}
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

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="!bg-[#1e1e1e] p-6 rounded-lg w-11/12 md:w-1/2 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Update Product</h3>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Product Name</label>
                <input 
                  type="text"
                  name="name"
                  value={updateData.name}
                  onChange={handleUpdateChange}
                  className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Brand</label>
                <select 
                  name="brand"
                  value={updateData.brand}
                  onChange={handleUpdateChange}
                  className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
                  required
                >
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">MRP</label>
                  <input 
                    type="number"
                    name="MRP"
                    value={updateData.MRP}
                    onChange={handleUpdateChange}
                    className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Price</label>
                  <input 
                    type="number"
                    name="price"
                    value={updateData.price}
                    onChange={handleUpdateChange}
                    className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Color</label>
                  <input 
                    type="text"
                    name="color"
                    value={updateData.color}
                    onChange={handleUpdateChange}
                    className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">In Stock</label>
                  <select
                    name="inStock"
                    value={updateData.inStock}
                    onChange={(e) =>
                      setUpdateData((prev) => ({
                        ...prev,
                        inStock: e.target.value === 'true'
                      }))
                    }
                    className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">About</label>
                <textarea
                  name="about"
                  value={updateData.about}
                  onChange={handleUpdateChange}
                  className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Update Product Images (optional)</label>
                <input 
                  type="file"
                  multiple
                  onChange={(e) => setUpdateImages(e.target.files)}
                  className="w-full p-2 !bg-[#494949] text-white focus:outline-none"
                  accept="image/*"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
