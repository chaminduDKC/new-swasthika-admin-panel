import React, { useState } from 'react';

export const Logo = ({ className = 'h-10', showText = true, textClassName = '' }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3">
      {/* Logo Image with Placeholder Fallback */}
      {!imageError ? (
        <img
          src="/logo.png"
          alt="Floral Decor Logo"
          onError={() => setImageError(true)}
          className={`object-contain ${className}`}
        />
      ) : (
        /* Geometric Floral Motif Fallback Placeholder */
        <div
          className={`aspect-square rounded-xl bg-gradient-to-tr from-[#9E7244] to-[#C59B6D] flex items-center justify-center text-white shadow-xs p-2 ${className}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
            <path d="M12 2C8 6 6 8 6 12s2 6 6 10c4-4 6-6 6-10s-2-6-6-10z" />
            <path d="M2 12c4-4 6-6 10-6s6 2 10 6-2 6-6 10-6-2-10-6z" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>
      )}

      {showText && (
        <div className={textClassName}>
          <div className="font-serif font-bold text-stone-900 text-lg tracking-tight leading-none">
            ස්වස්තික
          </div>
          <div className="text-[10px] font-semibold text-[#9E7244] tracking-widest uppercase mt-0.5 font-sans">
            Floral Decor
          </div>
        </div>
      )}
    </div>
  );
};
