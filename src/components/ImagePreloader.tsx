'use client';
import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

/**
 * Component that preloads images in the browser using link prefetch
 * This helps ensure images are cached before components try to render them
 */
export function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    const preloadImages = () => {
      images.forEach(src => {
        // Create a link element for prefetching
        const link = document.createElement('link');
        link.rel = priority ? 'preload' : 'prefetch';
        link.as = 'image';
        link.href = src;
        
        // Add crossorigin attribute for better caching
        link.crossOrigin = 'anonymous';
        
        // Add to document head
        document.head.appendChild(link);
        
        // Also create an Image object for immediate loading
        if (priority) {
          const img = new Image();
          img.loading = 'eager';
          img.src = src;
        }
      });
    };

    preloadImages();

    // Cleanup function to remove preload links when component unmounts
    return () => {
      const links = document.querySelectorAll('link[rel="preload"][as="image"], link[rel="prefetch"][as="image"]');
      links.forEach(link => {
        if (images.includes(link.getAttribute('href') || '')) {
          link.remove();
        }
      });
    };
  }, [images, priority]);

  return null; // This component doesn't render anything
}

/**
 * Hook that preloads images and sets up caching headers
 */
export function useImageCaching(images: string[]) {
  useEffect(() => {
    // Set up service worker cache strategy for images if available
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheImages = async () => {
        try {
          const cache = await caches.open('venture-logos-v1');
          await cache.addAll(images);
        } catch (error) {
          console.warn('Failed to cache images:', error);
        }
      };

      cacheImages();
    }
    
    // Prefetch images using browser's native capabilities
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
    });
    
  }, [images]);
}