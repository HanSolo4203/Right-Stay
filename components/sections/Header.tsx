"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/stay-with-us', label: 'Stay With Us' },
  { href: '/tours', label: 'Tours' },
  { href: '/host-with-us', label: 'Property Management' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);

          if (scrollDifference > 5) {
            setIsScrollingDown(currentScrollY > 100);
            lastScrollY.current = currentScrollY;
          }

          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <header
      className={`z-20 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500 ease-in-out ${
        isScrollingDown
          ? 'fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'relative'
      }`}
    >
      <div className={`flex max-w-7xl mx-auto items-center justify-between transition-[padding] duration-500 ease-in-out px-4 sm:px-6 md:px-8 ${
        isScrollingDown ? 'py-4' : 'py-6'
      }`}>
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={closeMobileMenu}>
          <span className="truncate text-lg sm:text-xl tracking-tight text-white/95 font-semibold font-sans">
            Right Stay Africa
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="hover:text-white/90 text-sm text-white/80 transition whitespace-nowrap"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex min-h-11 min-w-11 text-white/80 bg-white/5 border-white/15 border rounded-xl items-center justify-center"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-10 bg-black/60 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div
        id="mobile-nav"
        className={`fixed z-20 left-4 right-4 top-[4.5rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto origin-top transition md:hidden rounded-3xl border border-white/10 bg-black/95 p-4 shadow-xl backdrop-blur ${
          mobileMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="hover:bg-white/5 text-base text-white/85 rounded-xl py-3 px-4 transition min-h-11 flex items-center"
              href={link.href}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
