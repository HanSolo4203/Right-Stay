/**
 * Fades the hero photograph into the premium section surface below.
 * Uses the same fixed gradient + texture as .premium-page-backdrop so the join stays seamless.
 * Parent section must be `position: relative`.
 */
export default function HeroPremiumFadeOverlay() {
  return (
    <div className="hero-premium-fade-wrap pointer-events-none absolute inset-x-0 bottom-0 z-[5]" aria-hidden>
      <div className="hero-premium-fade-gradient" />
      <div className="hero-premium-fade-texture" />
    </div>
  );
}
