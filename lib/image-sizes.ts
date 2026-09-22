/** Responsive `sizes` values aligned with layout breakpoints. */
export const IMAGE_SIZES = {
  /** Homepage / above-the-fold hero. CSS cap 1920; 2x displays pick 2560w from srcset. */
  heroLcp: '(max-width: 640px) 100vw, (max-width: 1080px) 100vw, 1920px',
  /** Inner-page heroes and large background sections. */
  hero: '(max-width: 768px) 100vw, (max-width: 1920px) 100vw, 1920px',
  /** Thin nav/header photo strip — do not fetch a full-bleed desktop hero. */
  heroHeader: '(max-width: 768px) 100vw, 800px',
  /** Accommodation / tour card main photo (~3-col grid). */
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  cardThumb: '32px',
  /** 3-column marketing grids. */
  gridThird: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px',
  /** 2-column split content. */
  half: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 640px',
  /**
   * Tall about-page collage tile. object-cover is height-driven (~450px) and
   * CSS-zoomed, so sizes must exceed the CSS width or Next serves a tiny bitmap.
   */
  collageFeature: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 720px',
  /** Booking / quick-view main gallery tile. */
  modalMain: '(max-width: 768px) 100vw, 640px',
  modalTile: '(max-width: 768px) 50vw, 320px',
  lightbox: '(max-width: 1280px) 90vw, 1152px',
  thumb96: '96px',
} as const;
