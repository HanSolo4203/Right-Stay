/** Shared glassmorphism surfaces (hero search, minimized filter, panels). */
export const glassShadow =
  "shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]";

export const glassFrostPanel =
  `border border-white/10 backdrop-blur-xl bg-white/5 ${glassShadow}`;

export const glassFrostPill =
  `border border-white/20 backdrop-blur-xl bg-white/10 ${glassShadow} transition hover:bg-white/[0.14] hover:border-white/30`;

export const glassFrostInput =
  "bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent";
