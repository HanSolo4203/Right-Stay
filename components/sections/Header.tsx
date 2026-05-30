"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/stay-with-us", label: "Stay With Us" },
  { href: "/tours", label: "Tours" },
  { href: "/host-with-us", label: "Property Management" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  const headerChrome = (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-black/90 shadow-lg md:backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={closeMobileMenu}>
            <span className="truncate font-sans text-lg font-semibold tracking-tight text-white/95 sm:text-xl">
              Right Stay Africa
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                className="whitespace-nowrap text-sm text-white/80 transition hover:text-white/90"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[90] bg-black/60 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div
        id="mobile-nav"
        className={`fixed z-[110] left-4 right-4 top-[var(--site-header-height)] max-h-[calc(100dvh-var(--site-header-height)-1rem)] overflow-y-auto origin-top transition-[opacity,transform] duration-200 md:hidden rounded-3xl border border-white/10 bg-black/95 p-4 shadow-xl ${
          mobileMenuOpen
            ? "visible scale-100 opacity-100"
            : "invisible pointer-events-none scale-95 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="flex min-h-11 items-center rounded-xl px-4 py-3 text-base text-white/85 transition hover:bg-white/5"
              href={link.href}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {mounted ? createPortal(headerChrome, document.body) : null}
      <div aria-hidden="true" className="h-[var(--site-header-height)] shrink-0" />
    </>
  );
}
