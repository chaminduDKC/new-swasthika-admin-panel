import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const LazyImage = ({
  src,
  alt = '',
  className = '',
  containerClassName = 'w-full h-full',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${containerClassName}`}>
      {/* Shimmer Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-gold-50/50 to-stone-100 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gold-300/60 animate-bounce" />
        </div>
      )}

      {/* Error State */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-2 text-center text-xs">
          <ImageIcon className="w-6 h-6 mb-1 text-stone-300" />
          <span>Failed to load</span>
        </div>
      ) : (
        /* Actual Image with Lazy Loading */
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-xs'
          } ${className}`}
        />
      )}
    </div>
  );
};
