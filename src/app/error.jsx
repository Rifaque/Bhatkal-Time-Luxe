'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#D1B23E] font-semibold mb-5">
          Error
        </p>
        <h1 className="text-3xl font-serif font-bold mb-4 text-white">
          Something went wrong
        </h1>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">
          We encountered an unexpected error. Please try again or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#D1B23E] text-black font-semibold px-8 py-3 rounded-xl text-sm hover:bg-[#c1a22e] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="border border-white/10 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
