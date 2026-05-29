"use client";

import { createContext, useContext } from "react";

const PremiumBackgroundContext = createContext(false);

export function usePremiumPageBackground() {
  return useContext(PremiumBackgroundContext);
}

type PremiumBackgroundProviderProps = {
  children: React.ReactNode;
  className?: string;
};

/** Marks child sections as using the shared PremiumPageBackdrop (transparent section surfaces). */
export default function PremiumBackgroundProvider({
  children,
  className = "",
}: PremiumBackgroundProviderProps) {
  return (
    <PremiumBackgroundContext.Provider value={true}>
      <div className={`relative z-[1] ${className}`.trim()}>{children}</div>
    </PremiumBackgroundContext.Provider>
  );
}
