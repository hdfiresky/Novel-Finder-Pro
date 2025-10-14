
import React, { useState } from 'react';

interface ImageWithLoaderProps {
  /** The source URL of the image. */
  src: string;
  /** The alternative text for the image, for accessibility. */
  alt: string;
  /** Optional additional CSS classes to apply to the container. */
  className?: string;
  /** Optional click handler for the image container. */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * An image component that displays a loading placeholder (a pulsing background)
 * until the actual image has finished loading. This improves the perceived performance
 * and user experience by preventing layout shifts and blank spaces.
 * @param {ImageWithLoaderProps} props The props for the ImageWithLoader component.
 * @returns {JSX.Element} A container with a loading state and the image.
 */
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
