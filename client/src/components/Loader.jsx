import React from 'react';

const Loader = () => {
  return (
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full border-yellow-500 mx-auto animate-luxurious" />
      <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        Finding the perfect timepiece for you...
      </p>

      <style>
        {`
          @keyframes luxurious-spin {
            0% {
              transform: rotate(0deg) scale(1);
              opacity: 0.9;
            }
            50% {
              transform: rotate(180deg) scale(1.1);
              opacity: 1;
            }
            100% {
              transform: rotate(360deg) scale(1);
              opacity: 0.9;
            }
          }
          .animate-luxurious {
            animation: luxurious-spin 1.5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
