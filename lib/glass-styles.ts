/** Shared glassmorphism surfaces (hero search, minimized filter, panels). */
export const glassShadow = "shadow-lg shadow-black/25";

export const glassFrostPanel =
  `border border-white/10 backdrop-blur-xl bg-white/5 ${glassShadow}`;

export const glassFrostPill =
  `border border-white/20 backdrop-blur-xl bg-white/10 ${glassShadow} transition hover:bg-white/[0.14] hover:border-white/30`;

export const glassFrostInput =
  "bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent";

/** Solid fallback for mobile where backdrop-blur is disabled globally. */
export const glassFrostPanelMobile =
  "border border-white/10 bg-black/80 shadow-lg shadow-black/25";
