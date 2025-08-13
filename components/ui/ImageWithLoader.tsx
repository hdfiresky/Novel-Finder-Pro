import React, { useState } from 'react';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ src, alt, className = '', onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-gray-700 ${className} ${!isLoaded ? 'animate-pulse' : ''}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithLoader;
