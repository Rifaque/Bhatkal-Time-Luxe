'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Package, Truck, ShieldCheck, RefreshCw, CreditCard, MessageCircle } from 'lucide-react';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import { useStoreSettings } from '@/context/StoreSettingsContext';

const faqCategories = [
  {
    id: 'orders',
    label: 'Orders',
    icon: Package,
    questions: [
      {
        q: 'What is Bhatkal Time Luxe?',
        a: 'Bhatkal Time Luxe is a premier luxury watch marketplace offering certified pre-owned and new timepieces from the world\'s most distinguished houses — including Rolex, Omega, Seiko, Tissot, and Casio. Every reference is authenticated, cataloged, and delivered with full documentation.',
      },
      {
        q: 'How do I place an order?',
        a: 'Browse our catalog, add the desired timepiece to your cart, and proceed to checkout. Our checkout process routes your order through WhatsApp, where our concierge team confirms your order, verifies availability, and provides shipping timelines directly.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'Orders may be modified or cancelled within 12 hours of placement. Contact us immediately via WhatsApp or our Contact page. After 12 hours, the order may be in fulfillment and modifications cannot be guaranteed.',
      },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: Truck,
    questions: [
      {
        q: 'Do you offer international shipping?',
        a: 'We currently serve Kuwait and the wider GCC region. International shipping beyond the Gulf Cooperation Council is under active development — join our Collector\'s Club to receive updates.',
      },
      {
        q: 'Is shipping free?',
        a: 'Yes. All orders within Kuwait are shipped complimentary with full insurance. Your timepiece is handled with premium care, insured for its full purchase value, and delivered in a secure branded package.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Within Kuwait, deliveries typically arrive within 1–3 business days. GCC deliveries take 3–5 business days. Expedited and white-glove delivery options are available through our concierge team.',
      },
    ],
  },
  {
    id: 'authenticity',
    label: 'Authenticity',
    icon: ShieldCheck,
    questions: [
      {
        q: 'How do you guarantee watch authenticity?',
        a: 'Every timepiece undergoes a thorough authentication process by our certified horologists — including serial number verification, movement inspection, dial and case authenticity checks, and historical provenance review. You receive a full authenticity certificate with every purchase.',
      },
      {
        q: 'Are the watches new or pre-owned?',
        a: 'Our catalog includes both new-in-box and certified pre-owned references. Each listing clearly states its condition. Pre-owned watches undergo a comprehensive multi-point inspection and servicing before being listed.',
      },
      {
        q: 'Do watches come with original papers and box?',
        a: 'Availability of original papers, warranty cards, and box varies per listing and is clearly stated in the product description. All items arrive with our Bhatkal Time Luxe authenticity certificate regardless.',
      },
    ],
  },
  {
    id: 'returns',
    label: 'Returns',
    icon: RefreshCw,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for items in their original, unaltered condition with all packaging intact. The watch must not have been worn, sized, or serviced after receipt. Please contact our concierge team to initiate a return.',
      },
      {
        q: 'How is a return processed?',
        a: 'Contact us via WhatsApp or email to request a return authorisation. Once approved, we arrange a secure, insured pickup at no additional cost. Refunds are processed within 5–7 business days of receiving the returned item.',
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept KNET, bank transfer (IBAN), and select credit/debit card arrangements coordinated through our WhatsApp concierge. All transactions are handled securely and fully documented.',
      },
      {
        q: 'Are instalment options available?',
        a: 'Yes. Flexible no-cost instalment arrangements are available for select timepieces above KD 100. Our concierge team can provide details and eligibility criteria based on your preferred payment method.',
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: MessageCircle,
    questions: [
      {
        q: 'How can I contact customer support?',
        a: 'Our concierge team is available via WhatsApp, by phone, or through our Contact page. We respond to all enquiries within 2 hours during business hours (9 AM – 8 PM, 7 days a week).',
      },
      {
        q: 'Do you offer watch consultations?',
        a: 'Absolutely. Our certified horological specialists are available for personalised consultations on movement mechanics, reference selection, investment potential, and servicing timelines. Reach us via WhatsApp to schedule a private consultation.',
      },
    ],
  },
];

function FAQAccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className={`text-sm font-semibold leading-relaxed font-serif transition-colors ${isOpen ? 'text-[#D1B23E]' : 'text-white group-hover:text-[#D1B23E]'}`}>
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 mt-0.5 text-[#D1B23E] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-gray-400 font-serif leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function DesktopFAQView() {
  const [openItem, setOpenItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('orders');
  const { whatsappNumber } = useStoreSettings();

  const currentCategory = faqCategories.find((c) => c.id === activeCategory);

  const toggleItem = (key) => {
    setOpenItem(openItem === key ? null : key);
  };

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col">
      <DesktopNavbar />

      {/* Hero */}
      <section className="luxury-page-hero bg-gradient-to-b from-[#2A2A2A] to-[#1e1e1e] text-center relative overflow-x-hidden min-h-[580px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(209,178,62,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1B23E]/20 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 space-y-5">
          <div className="inline-flex items-center justify-center p-3 bg-[#D1B23E]/10 rounded-full border border-[#D1B23E]/20 mx-auto">
            <HelpCircle size={24} className="text-[#D1B23E]" />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D1B23E] font-bold block luxury-text-spacing">
            Client Guidance
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Frequently Asked Questions
          </h1>
          <div className="h-0.5 w-16 bg-[#D1B23E] mx-auto" />
          <p className="text-base text-gray-400 font-serif max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our catalog, authentication, shipping, and concierge services.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="luxury-page-section flex-1">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Category Sidebar */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-28 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-4 px-3">Topics</p>
                {faqCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setOpenItem(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#D1B23E] text-black shadow-[0_8px_24px_rgba(209,178,62,0.25)]'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* FAQ Accordion */}
            <div className="lg:col-span-9">
              {currentCategory && (
                <div>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-[#D1B23E]/10 rounded-xl text-[#D1B23E]">
                      <currentCategory.icon size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-white">{currentCategory.label}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{currentCategory.questions.length} questions</p>
                    </div>
                  </div>

                  <div className="bg-[#171717] border border-white/5 rounded-3xl px-6 divide-y divide-white/5">
                    {currentCategory.questions.map((item, i) => {
                      const key = `${activeCategory}-${i}`;
                      return (
                        <FAQAccordionItem
                          key={key}
                          question={item.q}
                          answer={item.a}
                          isOpen={openItem === key}
                          onToggle={() => toggleItem(key)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Still need help? */}
              <div className="mt-12 bg-gradient-to-br from-[#1a1500] to-[#0e0e0e] border border-[#D1B23E]/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Still have a question?</h3>
                  <p className="text-sm text-gray-400 mt-1 font-serif">
                    Our concierge specialists are available 9 AM – 8 PM, 7 days a week.
                  </p>
                </div>
                <a
                  href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '/contact'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold px-6 py-3 rounded-full text-sm transition-all shadow-[0_4px_20px_rgba(209,178,62,0.3)] hover:shadow-[0_4px_28px_rgba(209,178,62,0.45)]"
                >
                  <MessageCircle size={16} />
                  WhatsApp Concierge
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <DesktopFooter />
    </div>
  );
}
