"use client";

import { useEffect } from 'react';

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -5% 0px',
};

function observeElements(io: IntersectionObserver, selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    if (!el.classList.contains('animate')) {
      io.observe(el);
    }
  });
}

export const useScrollAnimation = (selector: string = '.animate-on-scroll', once: boolean = true) => {
  useEffect(() => {
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
            } else if (!once) {
              entry.target.classList.remove('animate');
            }
          });
        },
        OBSERVER_OPTIONS
      );
    }

    const io = window.__inViewIO;
    observeElements(io, selector);

    const mutationObserver = new MutationObserver(() => {
      observeElements(io, selector);
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
    };
  }, [selector, once]);
};

declare global {
  interface Window {
    __inViewIO: IntersectionObserver;
  }
}
