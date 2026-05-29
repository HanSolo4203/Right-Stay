"use client";

/** Viewport-fixed surface — mount once per page, above hero, before premium sections. */
export default function PremiumPageBackdrop() {
  return (
    <div className="premium-page-backdrop" aria-hidden="true">
      <div className="premium-page-backdrop__gradient" />
      <div className="premium-page-backdrop__texture" />
      <div className="premium-page-backdrop__glow premium-page-backdrop__glow--tl" />
      <div className="premium-page-backdrop__glow premium-page-backdrop__glow--r" />
      <div className="premium-page-backdrop__glow premium-page-backdrop__glow--b" />
      <div className="premium-page-backdrop__vignette" />
    </div>
  );
}
