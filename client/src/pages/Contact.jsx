import { useNavigate } from 'react-router-dom';
import {  Search, Home, Tag,Menu, ShoppingCart, Phone, MessageSquare } from 'lucide-react';
import btimehome from '../assets/images/btimehome.webp';
import { Button } from '../components/ui/button';
import HamburgerMenu from '../components/HamburgerMenu';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function Contact() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Replace these values with your actual contact details
  const mobileNumber = '+918050858500';
  const emailAddress = 'info@bhatkaltimeluxe.in';

  // WhatsApp link requires the number without the plus sign
  const whatsappLink = `https://wa.me/${mobileNumber.replace('+', '')}`;

  

  return (
    <div className="!bg-[#2A2A2A] text-white min-h-screen pb-16">
      {/* Header */}
      <header className="flex justify-between items-center p-2">
        <Button variant="ghost" className="mt-2" onClick={() => setMenuOpen(true)}>
          <Menu size={28} className="text-[#D1B23E]" />
        </Button>
        <img 
          src={btimehome}
          alt="Bhatkal Timeluxe Logo" 
          className="h-16 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <Button variant="ghost" className="mt-2" onClick={() => navigate('/search')}>
          <Search size={24} className="text-[#D1B23E]" />
        </Button>
      </header>

      <h1 className="text-2xl font-bold mt-8 text-center">Contact Us</h1>

      <section className="flex-1 flex flex-col space-y-6 items-center justify-center mt-32">
        <a href={`tel:+918050858500`} className="flex items-center space-x-2 text-lg text-[#D1B23E]">
          <Phone size={24} />
          <span>{mobileNumber}</span>
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-lg text-[#D1B23E]"
        >
          <MessageSquare size={24} />
          <span>WhatsApp Us</span>
        </a>
        <a href={`mailto:${emailAddress}`} className="flex items-center space-x-2 text-lg text-[#D1B23E]">
          <MessageSquare size={24} />
          <span>{emailAddress}</span>
        </a>

        <a 
  href="https://api.bhatkaltimeluxe.in/download-apk" 
  className="px-4 py-2 bg-[#D1B23E] text-white rounded"
>
  📥 Download APK
</a>
        
      </section>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-400 text-sm mb-6">
        <p>BHATKAL TIME LUXE</p>
        <p>
          Powered by{' '}
          <a 
            href="https://www.hubzero.in" // Replace with the actual Hubzero website
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-[#D1B23E] opacity-80 hover:underline"
          >
            Hubzero
          </a>
        </p>
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/918050858500"  // Replace with your actual WhatsApp number
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-3 z-50 bg-[#1e1e1e] p-4 rounded-full shadow-lg"
      >
        <FaWhatsapp size={24} style={{ color: "#D1B23E" }} />
      </a>

      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center !text-[#D1B23E]" 
          onClick={() => navigate('/')}
        >
          <Home size={24} />
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center !text-[#D1B23E]" 
          onClick={() => navigate('/brands')}
        >
          <Tag size={24} />
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center !text-[#D1B23E]" 
          onClick={() => navigate('/cart')}
        >
          <ShoppingCart size={24} />
        </Button>
      </nav>
      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
