"use client";

import { PREMIUM_BASE_COLOR, premiumSectionClassName } from "@/lib/premium-background";
import { usePremiumPageBackground } from "./PremiumBackgroundProvider";
import PremiumBackdropLayers from "./PremiumBackdropLayers";

type PremiumSectionBackgroundProps = {
  children: React.ReactNode;
  className?: string;
  /** @deprecated Ignored — one shared backdrop is used for seamless blending. */
  variant?: "dark" | "darker";
  id?: string;
};

export default function PremiumSectionBackground({
  children,
  className = "",
  id,
}: PremiumSectionBackgroundProps) {
  const hasSharedBackdrop = usePremiumPageBackground();

  return (
    <section
      id={id}
      className={`${premiumSectionClassName} overflow-hidden py-12 sm:py-16 ${className}`}
      style={hasSharedBackdrop ? undefined : { backgroundColor: PREMIUM_BASE_COLOR }}
    >
      {!hasSharedBackdrop && <PremiumBackdropLayers />}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
