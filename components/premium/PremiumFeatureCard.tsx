"use client";

import type { LucideIcon } from "lucide-react";

type PremiumFeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  variant?: "carousel" | "grid";
  className?: string;
};

export default function PremiumFeatureCard({
  icon: Icon,
  title,
  description,
  index = 0,
  variant = "grid",
  className = "",
}: PremiumFeatureCardProps) {
  const layoutClasses =
    variant === "carousel"
      ? "flex-shrink-0 w-[calc(100vw-3rem)] max-w-[320px] snap-start"
      : "w-full";

  return (
    <article
      className={`group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 sm:p-7 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1.5 hover:border-right-stay-400/30 hover:shadow-[0_20px_50px_rgba(51,126,47,0.15)] animate-on-scroll ${layoutClasses} ${className}`}
      style={{ animation: `fadeSlideIn 0.9s ease-out ${0.15 + index * 0.08}s both` }}
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-right-stay-400/0 via-right-stay-500/0 to-right-stay-600/0 opacity-0 transition-opacity duration-500 group-hover:opacity-20" />

      <div className="relative">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner transition-all duration-500 group-hover:border-right-stay-400/40 group-hover:bg-right-stay-500/20 group-hover:shadow-[0_0_24px_rgba(51,126,47,0.35)]">
          <Icon
            className="h-5 w-5 text-right-stay-300 transition-all duration-500 group-hover:text-right-stay-200 group-hover:drop-shadow-[0_0_8px_rgba(139,200,130,0.8)]"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-white/60 sm:text-base">
          {description}
        </p>
      </div>
    </article>
  );
}
