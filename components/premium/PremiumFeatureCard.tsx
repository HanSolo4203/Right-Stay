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
      className={`group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 sm:p-7 backdrop-blur-xl shadow-lg shadow-black/25 transition-[transform,opacity,border-color] duration-300 hover:-translate-y-1 hover:border-right-stay-400/30 animate-on-scroll ${layoutClasses} ${className}`}
      style={{ animation: `fadeSlideIn 0.6s ease-out ${0.08 + index * 0.04}s both` }}
    >
      <div className="relative">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-right-stay-400/40 group-hover:bg-right-stay-500/20">
          <Icon
            className="h-5 w-5 text-right-stay-300 transition-colors duration-300 group-hover:text-right-stay-200"
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
