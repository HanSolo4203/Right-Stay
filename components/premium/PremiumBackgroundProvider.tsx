"use client";

import { createContext, useContext } from "react";
import ScrollAnimationProvider from "@/components/providers/ScrollAnimationProvider";

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
      <ScrollAnimationProvider>
        <div className={`relative z-[1] ${className}`.trim()}>{children}</div>
      </ScrollAnimationProvider>
    </PremiumBackgroundContext.Provider>
  );
}
