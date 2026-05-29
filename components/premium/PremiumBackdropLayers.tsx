"use client";

/** Fallback in-section layers when no PremiumBackgroundProvider wraps the page. */
export default function PremiumBackdropLayers() {
  return (
    <>
      <div className="premium-page-backdrop__gradient pointer-events-none absolute inset-0" />
      <div className="premium-page-backdrop__texture pointer-events-none absolute inset-0" />
      <div className="premium-page-backdrop__glow premium-page-backdrop__glow--tl pointer-events-none absolute" />
      <div className="premium-page-backdrop__glow premium-page-backdrop__glow--r pointer-events-none absolute" />
      <div className="premium-page-backdrop__glow premium-page-backdrop__glow--b pointer-events-none absolute" />
      <div className="premium-page-backdrop__vignette pointer-events-none absolute inset-0" />
    </>
  );
}
