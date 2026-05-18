/** Responsive `sizes` values aligned with layout breakpoints. */
export const IMAGE_SIZES = {
  /** Homepage / above-the-fold hero (full viewport width). */
  heroLcp: '100vw',
  /** Inner-page heroes and large background sections (capped at 1920px). */
  hero: '(max-width: 1920px) 100vw, 1920px',
  /** Accommodation / tour card main photo (~3-col grid). */
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  cardThumb: '32px',
  /** 3-column marketing grids. */
  gridThird: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px',
  /** 2-column split content. */
  half: '(max-width: 1024px) 100vw, 640px',
  /** Booking / quick-view main gallery tile. */
  modalMain: '(max-width: 768px) 100vw, 640px',
  modalTile: '(max-width: 768px) 50vw, 320px',
  lightbox: '(max-width: 1280px) 90vw, 1152px',
  thumb96: '96px',
} as const;
