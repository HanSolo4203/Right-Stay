"use client";

import PremiumContentBlock from "@/components/premium/PremiumContentBlock";
import { TOUR_PROCESS_STEPS } from "@/lib/tours-content";

export default function ToursProcessSection() {
  return (
    <PremiumContentBlock
      eyebrow="Our Process"
      title="How We Create Experiences"
      subtitle="A seamless journey from your first conversation to unforgettable memories — we handle every detail."
      centered
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 right-0 top-[3.5rem] hidden h-px bg-gradient-to-r from-transparent via-right-stay-500/40 to-transparent lg:block"
          aria-hidden
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {TOUR_PROCESS_STEPS.map((step, index) => (
            <article
              key={step.number}
              className="group relative animate-on-scroll"
              style={{ animation: `fadeSlideIn 0.7s ease-out ${0.12 + index * 0.08}s both` }}
            >
              <div className="relative mb-6 flex items-center gap-4 lg:flex-col lg:items-center lg:text-center">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-right-stay-400/40 lg:h-16 lg:w-16">
                  <step.icon
                    className="h-6 w-6 text-right-stay-300 transition-colors duration-300 group-hover:text-right-stay-200 lg:h-7 lg:w-7"
                    strokeWidth={1.25}
                  />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-right-stay-500 text-[10px] font-bold text-white shadow-[0_0_20px_rgba(51,126,47,0.4)]">
                    {step.number.replace("0", "")}
                  </span>
                </div>

                {index < TOUR_PROCESS_STEPS.length - 1 && (
                  <div
                    className="hidden flex-1 h-px bg-gradient-to-r from-right-stay-500/30 to-transparent lg:hidden sm:block"
                    aria-hidden
                  />
                )}
              </div>

              <div className="lg:text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-right-stay-400/80">
                  Step {step.number}
                </p>
                <h3 className="font-display mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PremiumContentBlock>
  );
}
