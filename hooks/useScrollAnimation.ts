"use client";

import { useEffect } from 'react';

export const useScrollAnimation = (selector: string = '.animate-on-scroll', once: boolean = true) => {
  useEffect(() => {
    // Create or reuse the shared IntersectionObserver
    if (typeof window === 'undefined') return;

    if (!window.__inViewIO) {
      window.__inViewIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate');
              if (once) {
                window.__inViewIO.unobserve(entry.target);
              }
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );
    }

    // Observe all elements matching the selector
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      window.__inViewIO.observe(el);
    });

    // Cleanup function
    return () => {
      elements.forEach((el) => {
        window.__inViewIO.unobserve(el);
      });
    };
  }, [selector, once]);
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __inViewIO: IntersectionObserver;
  }
}

