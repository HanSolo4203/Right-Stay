/** Shared premium section surface — one gradient + noise tile for seamless stacking. */
export const PREMIUM_BASE_COLOR = "#0e1814";
/** Matches .premium-page-backdrop__gradient stops for hero → section blends */
export const PREMIUM_GRADIENT_START = "#080808";
export const PREMIUM_GRADIENT_MID = "#121816";
export const PREMIUM_GRADIENT_END = "#0d1f16";

export const PREMIUM_TEXTURE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const premiumSectionClassName =
  "relative isolate bg-transparent scroll-contain-section";
