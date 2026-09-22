"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import GlassAccommodationSearch from "@/components/search/GlassAccommodationSearch";
import HeroBackgroundImage from "@/components/ui/HeroBackgroundImage";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import {
  type AccommodationSearchForm,
  formatGuestLabel,
  formatSearchDateRange,
} from "@/lib/accommodation-search";
import { glassFrostPill } from "@/lib/glass-styles";

const NAV_LINKS = [
  { href: "/stay-with-us", label: "Stay With Us" },
  { href: "/tours", label: "Tours" },
  { href: "/host-with-us", label: "Property Management" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

type MinimizedSearchHeaderProps = {
  formData: AccommodationSearchForm;
  onFormDataChange: (updates: Partial<AccommodationSearchForm>) => void;
  locations: string[];
  loadingLocations: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export default function MinimizedSearchHeader({
  formData,
  onFormDataChange,
  locations,
  loadingLocations,
  onSubmit,
}: MinimizedSearchHeaderProps) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeSearch = useCallback(() => setSearchExpanded(false), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    if (!searchExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [searchExpanded, closeSearch]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    onSubmit(e);
    closeSearch();
  };

  const locationLabel = formData.location || "Where to?";
  const datesLabel = formatSearchDateRange(formData.checkIn, formData.checkOut);
  const guestsLabel = formatGuestLabel(formData.guests);

  const headerChrome = (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] isolate border-b border-white/10">
        <div className="absolute inset-0 overflow-hidden">
          <HeroBackgroundImage
            src={MARKETING_IMAGES.heroCapeTown}
            sizes={IMAGE_SIZES.heroHeader}
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </div>

        <div className="relative bg-black/80 md:bg-white/[0.03] md:backdrop-blur-xl">
          <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-4 py-2.5 sm:px-6 md:flex md:gap-4 md:px-8 md:py-3">
            <Link
              href="/"
              className="col-start-1 row-start-1 w-fit min-w-0 justify-self-start truncate text-base font-semibold tracking-tight text-white/95 sm:text-lg md:shrink-0"
              onClick={closeMobileMenu}
            >
              Right Stay Africa
            </Link>

            <button
              type="button"
              onClick={() => setSearchExpanded(true)}
              className={`col-span-2 row-start-2 flex min-w-0 w-full items-center overflow-hidden rounded-full py-1 pl-1 pr-3 md:col-auto md:row-auto md:mx-auto md:max-w-xl md:flex-1 md:pr-1 ${glassFrostPill}`}
              aria-expanded={searchExpanded}
              aria-label="Edit search"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-md">
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <div className="hidden min-w-0 flex-1 items-center sm:flex">
                <span className="truncate px-4 py-2.5 text-sm font-medium text-white/95">
                  {locationLabel}
                </span>
                <span className="h-6 w-px shrink-0 bg-white/25" aria-hidden />
                <span className="truncate px-4 py-2.5 text-sm text-white/75">{datesLabel}</span>
                <span className="h-6 w-px shrink-0 bg-white/25" aria-hidden />
                <span className="truncate px-4 py-2.5 text-sm text-white/75">{guestsLabel}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start px-3 py-1.5 text-left sm:hidden">
                <span className="w-full truncate text-sm font-medium text-white/95">{locationLabel}</span>
                <span className="w-full truncate text-xs text-white/65">
                  {datesLabel} · {guestsLabel}
                </span>
              </div>
            </button>

            <nav className="hidden shrink-0 items-center gap-5 lg:flex" aria-label="Main">
              {NAV_LINKS.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-sm text-white/80 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className="col-start-2 row-start-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav
              className="border-t border-white/10 px-4 py-3 lg:hidden"
              aria-label="Mobile"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border border-transparent px-3 py-2.5 text-sm text-white/85 transition hover:border-white/10 hover:bg-white/10"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );

  return (
    <>
      {mounted ? createPortal(headerChrome, document.body) : null}
      <div aria-hidden="true" className="h-[var(--site-search-header-height)] shrink-0" />

      {searchExpanded && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-4 pt-[calc(var(--site-search-header-height)+0.75rem)] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close search"
            onClick={closeSearch}
          />
          <div className="relative z-10 w-full min-w-0 max-w-2xl">
            <GlassAccommodationSearch
              formData={formData}
              onFormDataChange={onFormDataChange}
              locations={locations}
              loadingLocations={loadingLocations}
              onSubmit={handleSubmit}
            />
            <button
              type="button"
              onClick={closeSearch}
              className="mt-4 w-full rounded-2xl border border-white/20 bg-white/10 py-3 text-sm font-medium text-white backdrop-blur-xl hover:bg-white/15 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
