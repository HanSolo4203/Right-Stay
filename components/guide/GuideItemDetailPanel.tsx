'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import ListingImage from '@/components/ui/ListingImage';
import { getGuideCategoryIcon } from '@/lib/guide-category-icons';
import { externalHref, googleMapsDirectionsUrl } from '@/lib/guide-links';
import { formatPhoneTel } from '@/lib/site-contact';
import type { GuidePlace } from '@/types/guide';

type GuideItemDetailPanelProps = {
  place: GuidePlace | null;
  onClose: () => void;
};

function priceLabel(place: GuidePlace): string | null {
  if (!place.price_level) return null;
  return place.price_level === 'free' ? 'Free' : place.price_level;
}

export default function GuideItemDetailPanel({ place, onClose }: GuideItemDetailPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPhotoIndex(0);
  }, [place?.id]);

  useEffect(() => {
    if (!place) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [place]);

  useEffect(() => {
    if (!place) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (!place.photos.length) return;
      if (event.key === 'ArrowLeft') {
        setPhotoIndex((index) => (index > 0 ? index - 1 : place.photos.length - 1));
      } else if (event.key === 'ArrowRight') {
        setPhotoIndex((index) => (index < place.photos.length - 1 ? index + 1 : 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, place]);

  if (!mounted || !place) return null;

  const CategoryIcon = getGuideCategoryIcon(place.category.icon);
  const photos = place.photos;
  const activePhoto = photos[photoIndex] || photos[0];
  const price = priceLabel(place);
  const directionsUrl = googleMapsDirectionsUrl(place.latitude, place.longitude);
  const phoneTel = place.phone ? formatPhoneTel(place.phone) : '';

  return createPortal(
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close place details"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-place-title"
        className="absolute inset-0 flex w-full flex-col overflow-hidden bg-[#f8f1e3] text-[#3f3428] shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:max-w-lg"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#e0d2b8] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8a7b68]">
            Place details
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#3f3428] transition hover:bg-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative aspect-[16/10] bg-[#efe4cf]">
            {activePhoto ? (
              <ListingImage
                src={activePhoto.url}
                alt={place.name}
                variant="modalMain"
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: place.category.color }}
              >
                <CategoryIcon className="h-12 w-12 text-white" strokeWidth={1.5} />
              </div>
            )}

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                  onClick={() =>
                    setPhotoIndex((index) => (index > 0 ? index - 1 : photos.length - 1))
                  }
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                  onClick={() =>
                    setPhotoIndex((index) => (index < photos.length - 1 ? index + 1 : 0))
                  }
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
                  {photoIndex + 1} / {photos.length}
                </p>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setPhotoIndex(index)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    index === photoIndex ? 'border-[#337e2f]' : 'border-transparent'
                  }`}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={index === photoIndex}
                >
                  <ListingImage
                    src={photo.url}
                    alt=""
                    variant="thumbnail"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

            <div className="px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ background: place.category.color }}
              >
                <CategoryIcon className="h-3.5 w-3.5" strokeWidth={2} />
                {place.category.name}
              </span>
              {price && (
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-[#5c4e3d]">
                  {price}
                </span>
              )}
            </div>

            <h2 id="guide-place-title" className="font-display text-2xl font-semibold tracking-tight">
              {place.name}
            </h2>

            {place.address && (
              <p className="mt-2 flex items-start gap-2 text-sm text-[#6d5e4c]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{place.address}</span>
              </p>
            )}

            <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-[#4b3f32]">
              {place.description}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#337e2f] px-4 text-sm font-semibold text-white transition hover:bg-[#2a6527]"
              >
                <MapPin className="h-4 w-4" />
                Directions
              </a>

              {place.website_url && (
                <a
                  href={externalHref(place.website_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d4c6b0] bg-white/70 px-4 text-sm font-semibold text-[#3f3428] transition hover:bg-white"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              )}

              {place.booking_url && (
                <a
                  href={externalHref(place.booking_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d4c6b0] bg-white/70 px-4 text-sm font-semibold text-[#3f3428] transition hover:bg-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Book
                </a>
              )}

              {place.phone && phoneTel && (
                <a
                  href={`tel:${phoneTel}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d4c6b0] bg-white/70 px-4 text-sm font-semibold text-[#3f3428] transition hover:bg-white"
                >
                  <Phone className="h-4 w-4" />
                  {place.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
