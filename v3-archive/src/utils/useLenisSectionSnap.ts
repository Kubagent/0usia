import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function useLenisSectionSnap({ selector = '.snap-section', duration = 1.1, easing = (t: number) => 1 - Math.pow(2, -10 * t) } = {}) {
  const isSnapping = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Remove any CSS scroll-snap-type from body or sections!
    // Only Lenis should control scroll.

    const lenis = new Lenis({
      duration,
      easing,
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      infinite: false,
    });

    function getSections() {
      return Array.from(document.querySelectorAll<HTMLElement>(selector));
    }

    // Strict section paging logic with scroll lock
    function setScrollLock(lock: boolean) {
      document.body.style.overflow = lock ? 'hidden' : '';
      document.documentElement.style.overflow = lock ? 'hidden' : '';
    }
    // Minimal debounce-based scroll snap for best trackpad support
    let wheelTimeout: number | null = null;
    let accumulatedDeltaY = 0;
    function debouncedWheelSnap() {
      const sections = getSections();
      if (!sections.length) return;
      const currentIdx = sections.findIndex(sec => Math.abs(sec.offsetTop - window.scrollY) < 8);
      let targetIdx = currentIdx;
      if (accumulatedDeltaY > 20) {
        targetIdx = Math.min(sections.length - 1, currentIdx + 1);
      } else if (accumulatedDeltaY < -20) {
        targetIdx = Math.max(0, currentIdx - 1);
      }
      if (targetIdx !== currentIdx) {
        isSnapping.current = true;
        setScrollLock(true);
        lenis.scrollTo(sections[targetIdx], { immediate: false });
        setTimeout(() => {
          isSnapping.current = false;
          setScrollLock(false);
        }, duration * 1000 + 200);
      }
      accumulatedDeltaY = 0;
    }
    function onWheel(e: WheelEvent) {
      if (isSnapping.current) {
        e.preventDefault();
        return;
      }
      // Only react to vertical scroll
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      accumulatedDeltaY += e.deltaY;
      e.preventDefault();
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      wheelTimeout = window.setTimeout(debouncedWheelSnap, 100);
    }
    window.addEventListener('wheel', onWheel, { passive: false });

    // Keyboard navigation for strict section snap
    function onKeyDown(e: KeyboardEvent) {
      if (isSnapping.current) {
        e.preventDefault();
        return;
      }
      const sections = getSections();
      if (!sections.length) return;
      const idx = sections.findIndex(sec => Math.abs(sec.offsetTop - window.scrollY) < 8);
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const next = sections[Math.min(sections.length - 1, Math.max(0, idx + 1))];
        isSnapping.current = true;
        setScrollLock(true);
        lenis.scrollTo(next, { immediate: false });
        setTimeout(() => {
          isSnapping.current = false;
          setScrollLock(false);
        }, duration * 1000 + 200);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prev = sections[Math.max(0, idx - 1)];
        isSnapping.current = true;
        setScrollLock(true);
        lenis.scrollTo(prev, { immediate: false });
        setTimeout(() => {
          isSnapping.current = false;
          setScrollLock(false);
        }, duration * 1000 + 200);
      }
    }
    window.addEventListener('keydown', onKeyDown, { passive: false });

    // Lenis RAF
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [selector, duration, easing]);
}
