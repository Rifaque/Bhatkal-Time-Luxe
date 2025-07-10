import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Tag, ShoppingCart, ChevronDown,Menu, Search, ChevronUp } from 'lucide-react';
import btimehome from '../assets/images/btimehome.webp';
import { Button } from '../components/ui/button';
import HamburgerMenu from '../components/HamburgerMenu';
import { FaWhatsapp } from 'react-icons/fa';

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const faqs = [
    {
      question: 'What is Bhatkal Timeluxe?',
      answer: 'Bhatkal Timeluxe is a premier luxury store offering high-end watches, accessories, and more.',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we ship only within India. We are working on expanding our shipping options.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for unused and undamaged products in their original packaging.',
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach us via phone, WhatsApp, or email. Visit our Contact page for details.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">Frequently Asked Questions</h1>

      <section className="flex-1 p-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-600 p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp size={20} className="text-[#D1B23E]" />
              ) : (
                <ChevronDown size={20} className="text-[#D1B23E]" />
              )}
            </div>
            {openIndex === index && <p className="mt-2 text-gray-300">{faq.answer}</p>}
          </div>
        ))}
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
