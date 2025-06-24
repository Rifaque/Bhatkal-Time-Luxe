import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProductsManager() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // State for adding new product
  const [name, setName] = useState('');
  const [brand, setBrand] = useState(''); // holds selected brand id
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
  // NEW state for update images
  const [updateImages, setUpdateImages] = useState(null);

  // Memoized fetchProducts function
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get('https://api.bhatkaltimeluxe.in/api/products');
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    }
  }, []);

  // Memoized fetchBrands function (without brand dependency)
  const fetchBrands = useCallback(async () => {
    try {
      const { data } = await axios.get('https://api.bhatkaltimeluxe.in/api/brands');
      setBrands(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  }, []);

  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  // Run fetch functions on component mount
  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [fetchProducts, fetchBrands]);

  // Set default brand when brands are loaded
  useEffect(() => {
    if (brands.length > 0 && !brand) {
      setBrand(brands[0]._id);
    }
  }, [brands, brand]);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Basic validation
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
    
    // Append images (allow up to 5 images)
    Array.from(images).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('https://api.bhatkaltimeluxe.in/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Product added successfully!');
      // Reset form fields
      setName('');
      setBrand(brands.length > 0 ? brands[0]._id : '');
      setMRP('');
      setPrice('');
      setInStock(true);
      setColor('');
      setAbout('');
      setImages([]);
      fetchProducts(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://api.bhatkaltimeluxe.in/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  // Open update modal with pre-filled data
  const openUpdateModal = (product) => {
    setProductToUpdate(product);
    setUpdateData({
      name: product.name,
      brand: product.brand, // might be brand id or name depending on your API response
      MRP: product.MRP,
      price: product.price,
      inStock: product.inStock,
      color: product.color,
      about: product.about
    });
    // Reset updateImages to null when opening the modal
    setUpdateImages(null);
    setUpdateModalOpen(true);
  };

  // Handle changes in the update modal form
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit updated product data
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      // If updateImages is provided, create FormData and append new images
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
        await axios.put(`https://api.bhatkaltimeluxe.in/api/products/${productToUpdate._id}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Otherwise, update without changing images
        await axios.put(`https://api.bhatkaltimeluxe.in/api/products/${productToUpdate._id}`, updateData, {
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
    <div className="p-4 !bg-[#2A2A2A] text-white min-h-screen relative">
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
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
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
                .slice() // Create a copy to avoid modifying the original array
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
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
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Price</label>
            <input 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Color</label>
            <input 
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
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
              className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm mb-1">Product Images</label>
            <input 
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

      {/* Display products in tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedProducts.map((product) => {
          const decodedBrand = brands.find(b => b._id === product.brand);
          return (
            <div key={product._id} className="!bg-[#191919] p-4 rounded-lg shadow flex flex-col">
              <div className="flex items-center mb-2">
                {product.images && product.images.length > 0 && (
                  <img
                    src={`https://api.bhatkaltimeluxe.in/uploads/${product.images[0]}`}
                    alt={product.name}
                    className="w-16 h-16 object-contain rounded mr-2"
                    onError={(e) => (e.target.src = '/fallback-image.png')}
                  />
                )}
                <h3 className="text-lg font-semibold">{product.name}</h3>
              </div>
              <p className="text-sm">
                Brand: {decodedBrand ? decodedBrand.name : product.brand}
              </p>
              <p className="text-sm">MRP: &#8377; {product.MRP}</p>
              <p className="text-sm">Price: &#8377; {product.price}</p>
              <p className="text-sm">Color: {product.color}</p>
              <p className="text-sm">In Stock: {product.inStock ? 'Yes' : 'No'}</p>
              <div className="mt-2 flex space-x-2">
                <button 
                  onClick={() => handleDeleteProduct(product._id)}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <button 
                  onClick={() => openUpdateModal(product)}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
          onClick={() => navigate('/admin/dashboard')}
          className="px-4 py-2 bg-[#D1B23E] text-black rounded-full shadow-lg hover:bg-[#c1a22e] transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="!bg-[#1e1e1e] p-6 rounded-lg w-11/12 md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Update Product</h3>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Product Name</label>
                <input 
                  type="text"
                  name="name"
                  value={updateData.name}
                  onChange={handleUpdateChange}
                  className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
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
                    className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
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
                    className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
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
                    className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
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
                  className="w-full p-2 rounded !bg-[#494949] text-white focus:outline-none"
                ></textarea>
              </div>
              {/* NEW: File input for updating images */}
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-1">Update Product Images (optional)</label>
                <input 
                  type="file"
                  multiple
                  onChange={(e) => setUpdateImages(e.target.files)}
                  className="w-full p-2 !bg-[#494949] text-white focus:outline-none"
                  accept="image/*"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
