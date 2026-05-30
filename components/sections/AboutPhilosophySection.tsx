"use client";

import PremiumSectionBackground from "@/components/premium/PremiumSectionBackground";

export default function AboutPhilosophySection() {
  return (
    <PremiumSectionBackground className="!py-20 sm:!py-28 lg:!py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="relative mx-auto max-w-5xl text-center">
          <div
            className="pointer-events-none absolute -inset-x-8 -inset-y-12 rounded-full bg-right-stay-500/10 blur-3xl animate-on-scroll"
            style={{ animation: "philosophyGlow 8s ease-in-out infinite alternate" }}
            aria-hidden
          />

          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.32em] text-right-stay-400/80"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
          >
            Our Philosophy
          </p>

          <blockquote
            className="animate-on-scroll relative mt-8 font-display text-2xl font-medium leading-[1.2] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem]"
            style={{ animation: "fadeSlideIn 1.1s ease-out 0.15s both" }}
          >
            <span
              className="absolute -left-2 -top-6 font-serif text-6xl leading-none text-right-stay-500/30 sm:-left-4 sm:-top-8 sm:text-7xl"
              aria-hidden
            >
              &ldquo;
            </span>
            Never settle for what the industry considers acceptable when{" "}
            <span className="bg-gradient-to-r from-right-stay-300 to-right-stay-500 bg-clip-text text-transparent">
              exceptional
            </span>{" "}
            is possible.
          </blockquote>

          <div
            className="animate-on-scroll mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-right-stay-400/60 to-transparent"
            style={{ animation: "fadeSlideIn 1s ease-out 0.3s both" }}
          />
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
