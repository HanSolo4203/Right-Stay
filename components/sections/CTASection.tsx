"use client";

import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ArrowRight, ShieldCheck, CheckCircle, Headphones } from "lucide-react";
import PremiumSectionBackground from "@/components/premium/PremiumSectionBackground";

export default function CTASection() {
  useScrollAnimation();

  return (
    <PremiumSectionBackground className="!py-12 sm:!py-16">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
          >
            Start Your Journey
          </p>
          <h2
            className="animate-on-scroll mt-4 font-display text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
          >
            Ready to experience Africa your way?
          </h2>
          <p
            className="animate-on-scroll mt-6 text-lg leading-relaxed text-white/70 max-w-3xl mx-auto sm:text-xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.2s both" }}
          >
            Welcome to Africa, managed properly. Where properties are managed right and every stay
            is lekker — genuine hospitality and accommodation done the right way.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-on-scroll"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.28s both" }}
          >
            <Link
              href="/accommodations"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-right-stay-500 px-8 py-4 font-semibold text-white shadow-[0_0_40px_rgba(51,126,47,0.35)] transition-all duration-300 hover:bg-right-stay-400 hover:-translate-y-0.5"
            >
              Browse Properties
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div
            className="flex flex-wrap justify-center gap-8 mt-12 animate-on-scroll"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.36s both" }}
          >
            {[
              { icon: ShieldCheck, label: "Secure Booking" },
              { icon: CheckCircle, label: "Verified Properties" },
              { icon: Headphones, label: "24/7 Support" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-white/75">
                <badge.icon className="h-5 w-5 text-right-stay-300" strokeWidth={1.5} />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
