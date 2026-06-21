'use client';

import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, ShieldCheck, Send, Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function DesktopContactView() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { whatsappNumber, supportPhone, supportEmail, businessAddress } = useStoreSettings();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    const text = encodeURIComponent(
      `*New Inquiry from ${form.name}*\nEmail: ${form.email}\nSubject: ${form.subject || 'General Inquiry'}\n\n${form.message}`
    );
    if (whatsappNumber) window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col">
      <DesktopNavbar />

      {/* Hero */}
      <section className="luxury-page-hero bg-gradient-to-b from-[#2A2A2A] to-[#1e1e1e] text-center relative overflow-x-hidden min-h-[580px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(209,178,62,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1B23E]/20 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 space-y-5">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D1B23E] font-bold block luxury-text-spacing">
            Personal Assistance
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Concierge Support
          </h1>
          <div className="h-0.5 w-16 bg-[#D1B23E] mx-auto" />
          <p className="text-base text-gray-400 font-serif max-w-xl mx-auto leading-relaxed">
            Our dedicated horological specialists are available to assist you with acquisitions, appraisals, servicing recommendations, and private inquiries.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="luxury-page-section flex-1">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left: Contact channels + info */}
            <div className="lg:col-span-5 space-y-6">

              {/* Direct Contact Options */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Reach Us Directly</p>

                <a
                  href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '/contact'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 bg-[#171717] border border-white/5 hover:border-[#D1B23E]/40 rounded-2xl p-5 group transition-all duration-200"
                >
                  <div className="p-3 bg-[#25D366]/10 rounded-xl text-[#25D366] shrink-0 group-hover:bg-[#25D366]/15 transition-colors">
                    <FaWhatsapp size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-serif group-hover:text-[#D1B23E] transition-colors">WhatsApp Concierge</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{supportPhone || whatsappNumber}</p>
                    <p className="text-xs text-gray-600 mt-1 font-serif">Fastest response. Available 9 AM – 9 PM AST daily.</p>
                  </div>
                </a>

                {supportPhone && (
                  <a
                    href={`tel:${supportPhone}`}
                    className="flex items-start gap-4 bg-[#171717] border border-white/5 hover:border-[#D1B23E]/40 rounded-2xl p-5 group transition-all duration-200"
                  >
                    <div className="p-3 bg-[#D1B23E]/10 rounded-xl text-[#D1B23E] shrink-0 group-hover:bg-[#D1B23E]/15 transition-colors">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white font-serif group-hover:text-[#D1B23E] transition-colors">Direct Phone Line</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{supportPhone}</p>
                      <p className="text-xs text-gray-600 mt-1 font-serif">Speak with a specialist directly.</p>
                    </div>
                  </a>
                )}

                {supportEmail && (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex items-start gap-4 bg-[#171717] border border-white/5 hover:border-[#D1B23E]/40 rounded-2xl p-5 group transition-all duration-200"
                  >
                    <div className="p-3 bg-[#D1B23E]/10 rounded-xl text-[#D1B23E] shrink-0 group-hover:bg-[#D1B23E]/15 transition-colors">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white font-serif group-hover:text-[#D1B23E] transition-colors">Email Correspondence</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{supportEmail}</p>
                      <p className="text-xs text-gray-600 mt-1 font-serif">For formal inquiries and documentation requests.</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Location + Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[#D1B23E]">
                    <MapPin size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
                  </div>
                  <p className="text-sm text-gray-300 font-serif leading-relaxed whitespace-pre-line">
                    {businessAddress || 'Bhatkal, Karnataka\nIndia — 581320'}
                  </p>
                </div>
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[#D1B23E]">
                    <Clock size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Hours</span>
                  </div>
                  <p className="text-sm text-gray-300 font-serif leading-relaxed">
                    Mon – Sun<br />9:00 AM – 9:00 PM AST
                  </p>
                </div>
              </div>

              {/* Trust note */}
              <div className="flex items-start gap-3 bg-[#D1B23E]/5 border border-[#D1B23E]/15 rounded-2xl p-4">
                <ShieldCheck size={18} className="text-[#D1B23E] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 font-serif leading-relaxed">
                  All communications are confidential. We never share client information with third parties. Inquiries about high-value acquisitions are handled with complete discretion.
                </p>
              </div>

              {/* Concierge Services */}
              <div className="bg-[#171717] border border-white/5 rounded-2xl p-5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-semibold">Concierge Services</p>
                {[
                  'Product consultation & timepiece selection',
                  'Order tracking & fulfilment support',
                  'Authentication & certification assistance',
                  'Private collection & acquisition inquiries',
                ].map((service) => (
                  <div key={service} className="flex items-center gap-2.5 text-xs text-gray-400 font-serif">
                    <span className="w-1 h-1 rounded-full bg-[#D1B23E] shrink-0" />
                    {service}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#171717] border border-white/5 rounded-3xl p-8">
                <div className="mb-8">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#D1B23E] font-bold luxury-text-spacing">Private Inquiry</span>
                  <h2 className="text-2xl font-serif font-bold text-white mt-2">Send Us a Message</h2>
                  <p className="text-sm text-gray-500 mt-1 font-serif">
                    Your inquiry will be routed to our WhatsApp concierge for a personal response.
                  </p>
                </div>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center animate-fade-in">
                    <div className="p-4 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
                      <Check size={28} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white">Inquiry Submitted</h3>
                    <p className="text-sm text-gray-400 font-serif max-w-sm">
                      Your message has been sent to our WhatsApp concierge. A specialist will respond within 2 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Full Name <span className="text-[#D1B23E]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D1B23E] transition-colors placeholder-gray-600 font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Email Address <span className="text-[#D1B23E]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D1B23E] transition-colors placeholder-gray-600 font-sans"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="e.g. Rolex Datejust inquiry, servicing question…"
                        className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D1B23E] transition-colors placeholder-gray-600 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Message <span className="text-[#D1B23E]">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Describe your inquiry, the reference you're interested in, or the assistance you need…"
                        className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D1B23E] transition-colors placeholder-gray-600 font-sans resize-none leading-relaxed"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(209,178,62,0.25)] hover:shadow-[0_4px_28px_rgba(209,178,62,0.4)]"
                    >
                      <Send size={15} />
                      Send via WhatsApp Concierge
                    </button>
                    <p className="text-[11px] text-center text-gray-600 font-sans">
                      Submitting this form opens WhatsApp with your message pre-filled for seamless communication.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <DesktopFooter />
    </div>
  );
}
