/**
 * Softens the hero photograph into the shared premium surface below.
 * Covers the photo, then goes transparent at the section edge so the fixed
 * backdrop continues uninterrupted. Parent section must be `position: relative`.
 */
export default function HeroPremiumFadeOverlay() {
  return (
    <div className="hero-premium-fade-wrap pointer-events-none absolute inset-x-0 bottom-0 z-[5]" aria-hidden>
      <div className="hero-premium-fade-gradient" />
      <div className="hero-premium-fade-texture" />
    </div>
  );
}
