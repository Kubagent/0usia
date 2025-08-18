'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

interface PreloadedImage {
  url: string;
  status: 'pending' | 'loaded' | 'error';
  image?: HTMLImageElement;
}

interface UseImagePreloaderReturn {
  isLoading: boolean;
  hasErrors: boolean;
  loadedCount: number;
  totalCount: number;
  progress: number;
  preloadedImages: Map<string, HTMLImageElement>;
  errors: string[];
  retryFailed: () => void;
}

/**
 * Custom hook for preloading multiple images with detailed progress tracking
 * Ensures all images are fully loaded before marking as complete
 * Includes retry logic and error handling
 */
export function useImagePreloader(imageUrls: string[]): UseImagePreloaderReturn {
  const [images, setImages] = useState<Map<string, PreloadedImage>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const abortController = useRef<AbortController>();
  
  const initializeImages = useCallback(() => {
    const initialImages = new Map<string, PreloadedImage>();
    imageUrls.forEach(url => {
      initialImages.set(url, { url, status: 'pending' });
    });
    setImages(initialImages);
    setIsLoading(imageUrls.length > 0);
  }, [imageUrls.join(',')]);

  const preloadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set up load handler
      img.onload = () => {
        resolve(img);
      };
      
      // Set up error handler  
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Start loading
      img.src = url;
    });
  }, []);

  const loadImages = useCallback(async () => {
    if (imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    // Cancel any previous loading
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    setIsLoading(true);
    const loadedImagesMap = new Map<string, HTMLImageElement>();
    const updatedImages = new Map<string, PreloadedImage>();
    
    try {
      // Load images concurrently
      const loadPromises = imageUrls.map(async (url) => {
        try {
          const img = await preloadImage(url);
          
          // Check if we were aborted
          if (signal.aborted) {
            return;
          }
          
          loadedImagesMap.set(url, img);
          updatedImages.set(url, { url, status: 'loaded', image: img });
          
        } catch (error) {
          if (signal.aborted) {
            return;
          }
          
          updatedImages.set(url, { url, status: 'error' });
        }
      });

      await Promise.all(loadPromises);
      
      if (!signal.aborted) {
        // Batch update to prevent multiple re-renders
        setImages(prev => {
          const newImages = new Map(prev);
          updatedImages.forEach((value, key) => {
            newImages.set(key, value);
          });
          return newImages;
        });
        setPreloadedImages(loadedImagesMap);
        setIsLoading(false);
      }
      
    } catch (error) {
      if (!signal.aborted) {
        console.error('Image preloading failed:', error);
        setIsLoading(false);
      }
    }
  }, [imageUrls.join(','), preloadImage]);

  const retryFailed = useCallback(() => {
    setImages(prev => {
      const failedUrls = Array.from(prev.values())
        .filter(img => img.status === 'error')
        .map(img => img.url);
        
      if (failedUrls.length > 0) {
        const newImages = new Map(prev);
        failedUrls.forEach(url => {
          newImages.set(url, { url, status: 'pending' });
        });
        
        // Trigger reload by resetting loading state
        setIsLoading(true);
        
        return newImages;
      }
      return prev;
    });
  }, []);

  // Initialize and load images when URLs change
  useEffect(() => {
    initializeImages();
  }, [imageUrls.join(',')]);

  useEffect(() => {
    if (isLoading && imageUrls.length > 0) {
      loadImages();
    }
    
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [imageUrls.join(','), isLoading]);

  // Calculate derived state
  const imageList = Array.from(images.values());
  const loadedCount = imageList.filter(img => img.status === 'loaded').length;
  const totalCount = imageList.length;
  const hasErrors = imageList.some(img => img.status === 'error');
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 100;
  const errors = imageList
    .filter(img => img.status === 'error')
    .map(img => img.url);

  return {
    isLoading,
    hasErrors,
    loadedCount,
    totalCount,
    progress,
    preloadedImages,
    errors,
    retryFailed
  };
}

/**
 * Simple hook for preloading a single image
 */
export function useSingleImagePreloader(imageUrl: string | null): {
  isLoading: boolean;
  hasError: boolean;
  preloadedImage: HTMLImageElement | null;
} {
  const urls = imageUrl ? [imageUrl] : [];
  const { isLoading, hasErrors, preloadedImages } = useImagePreloader(urls);
  
  return {
    isLoading,
    hasError: hasErrors,
    preloadedImage: imageUrl ? preloadedImages.get(imageUrl) || null : null
  };
}