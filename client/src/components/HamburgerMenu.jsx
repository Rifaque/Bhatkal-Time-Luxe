// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react'; // X icon for closing
import { Button } from '../components/ui/button';
// import btimehome from '../assets/images/btimehome.webp';
import btime from '../assets/images/btime.webp';

export default function HamburgerMenu({ isOpen, onClose }) {
  const navigate = useNavigate();

  // A function to handle navigation and closing the menu
  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Slide-out menu */}
      <div
        className={`fixed inset-y-0 left-0 bg-[#2A2A2A] text-white z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 p-4`}
      >
        {/* Header with logo and close button */}
        <div className="flex justify-between items-start mb-8">
          <img
            src={btime}
            alt="Bhatkal Timeluxe Logo"
            className="h-44"
            onClick={() => handleNavigation('/')}
          />
          <Button variant="ghost" onClick={onClose}>
            <X size={24} className="text-[#D1B23E]" />
          </Button>
        </div>

        {/* Navigation items */}
        <ul className="space-y-6">
          <li className="cursor-pointer text-lg" onClick={() => handleNavigation('/')}>
            Home
          </li>
          <li className="cursor-pointer text-lg" onClick={() => handleNavigation('/brands')}>
            Collections
          </li>
          <li className="cursor-pointer text-lg" onClick={() => handleNavigation('/new-arrivals')}>
            New Arrivals
          </li>
          <li className="cursor-pointer text-lg" onClick={() => handleNavigation('/contact')}>
            Contact
          </li>
          <li className="cursor-pointer text-lg" onClick={() => handleNavigation('/faq')}>
            FAQ
          </li>
        </ul>
      </div>
    </>
  );
}
