"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import PremiumSectionBackground from "@/components/premium/PremiumSectionBackground";

export default function ToursCTASection() {
  return (
    <PremiumSectionBackground className="!py-16 sm:!py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center md:px-8">
        <div className="mx-auto max-w-4xl">
          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
          >
            Start Your Journey
          </p>

          <h2
            className="animate-on-scroll mt-4 font-display text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
          >
            Ready To Discover Africa Your Way?
          </h2>

          <p
            className="animate-on-scroll mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.2s both" }}
          >
            Whether you&apos;re chasing adventure, culture, wildlife or relaxation, we&apos;ll
            create an experience tailored specifically for you.
          </p>

          <div
            className="animate-on-scroll mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.28s both" }}
          >
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-right-stay-500 px-8 py-4 font-semibold text-white shadow-[0_0_40px_rgba(51,126,47,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-right-stay-400"
            >
              Start Planning
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
            >
              <MessageCircle className="h-5 w-5" />
              Speak To A Travel Expert
            </Link>
          </div>
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
