"use client";

import PremiumSectionBackground from "./PremiumSectionBackground";

type PremiumContentBlockProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "dark" | "darker";
  className?: string;
  centered?: boolean;
  id?: string;
};

export default function PremiumContentBlock({
  eyebrow,
  title,
  subtitle,
  children,
  variant = "dark",
  className = "",
  centered = false,
  id,
}: PremiumContentBlockProps) {
  return (
    <PremiumSectionBackground id={id} variant={variant} className={className}>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className={`mb-12 sm:mb-16 ${centered ? "text-center mx-auto max-w-3xl" : "max-w-3xl"}`}>
          {eyebrow && (
            <p
              className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
              style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={`animate-on-scroll font-display text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl ${eyebrow ? "mt-4" : ""}`}
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="animate-on-scroll mt-5 text-base leading-relaxed text-white/60 sm:text-lg"
              style={{ animation: "fadeSlideIn 0.9s ease-out 0.2s both" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </PremiumSectionBackground>
  );
}
