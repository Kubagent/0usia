"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
// Debug: Log Lenis import
console.log('Lenis import:', Lenis);

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let lenis: any = undefined;
    try {
      if (Lenis) {
        lenis = new Lenis({
          duration: 2.2, // seconds, for ultra-smooth, slow scroll
          easing: (t: number) => 1 - Math.pow(1 - t, 2), // easeOutQuad
          gestureOrientation: "vertical",
          touchMultiplier: 1.2,
          infinite: false,
        });
        lenisRef.current = lenis;
        // Debug: Log Lenis instance
        console.log('Lenis instance:', lenis);
      } else {
        console.warn('Lenis is undefined');
      }
    } catch (e) {
      console.error('Error initializing Lenis:', e);
    }

    function raf(time: number) {
      if (lenis && typeof lenis.raf === 'function') {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
    }
    if (lenis && typeof lenis.raf === 'function') {
      requestAnimationFrame(raf);
    }

    return () => {
      if (lenis && typeof lenis.destroy === 'function') {
        lenis.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
