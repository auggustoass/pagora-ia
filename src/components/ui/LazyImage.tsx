
import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Skeleton } from './skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
  skeletonClassName?: string;
}

export function LazyImage({
  src,
  alt,
  fallback,
  className = '',
  skeletonClassName = '',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError && fallback) {
    return <div ref={ref}>{fallback}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {!isLoaded && !hasError && (
        <Skeleton className={`w-full h-full ${skeletonClassName}`} />
      )}
      
      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}
