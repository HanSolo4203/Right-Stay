"use client";

import { useEffect } from 'react';

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -5% 0px',
};

export function isElementInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewportHeight * 0.95 && rect.bottom > 0;
}

function ensureInViewObserver(once: boolean): IntersectionObserver {
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
  return window.__inViewIO;
}

/** Register a single element once its scroll-animation class is applied. */
export function registerScrollAnimationElement(el: HTMLElement | null): () => void {
  if (!el || el.classList.contains('animate')) {
    return () => {};
  }

  if (isElementInViewport(el)) {
    el.classList.add('animate');
    return () => {};
  }

  const io = ensureInViewObserver(true);
  io.observe(el);
  return () => io.unobserve(el);
}

function observeElements(io: IntersectionObserver, selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    if (el.classList.contains('animate')) return;

    if (isElementInViewport(el)) {
      el.classList.add('animate');
      io.unobserve(el);
      return;
    }

    io.observe(el);
  });
}

export const useScrollAnimation = (selector: string = '.animate-on-scroll', once: boolean = true) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const io = ensureInViewObserver(once);
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
