/** Shared glassmorphism surfaces (hero search, minimized filter, panels). */
export const glassShadow = "shadow-lg shadow-black/25";

export const glassFrostPanel =
  `border border-white/10 backdrop-blur-xl bg-white/5 ${glassShadow}`;

export const glassFrostPill =
  `border border-white/20 backdrop-blur-xl bg-white/10 ${glassShadow} transition hover:bg-white/[0.14] hover:border-white/30`;

/** Hero search card — dark frosted glass so it reads over bright photography. */
export const glassSearchCard =
  "border border-white/25 bg-black/80 shadow-[0_28px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/20 backdrop-blur-2xl";

export const glassFrostInput =
  "rounded-2xl border border-white/20 bg-neutral-950 text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent";

/** Solid fallback for mobile where backdrop-blur is disabled globally. */
export const glassFrostPanelMobile =
  "border border-white/10 bg-black/80 shadow-lg shadow-black/25";
