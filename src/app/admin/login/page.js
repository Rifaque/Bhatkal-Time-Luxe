'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/admin/login', { username, password });
      const token = res.data.token;
      
      // Save in localStorage for backwards-compatible checks
      localStorage.setItem('adminToken', token);
      
      // Redirect to admin dashboard (Next.js middleware gates this)
      router.push('/admin/dashboard');
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
              className="w-full p-2 rounded bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
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
              className="w-full p-2 rounded bg-[#494949] text-white focus:outline-none focus:ring-1 focus:ring-[#D1B23E]"
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
