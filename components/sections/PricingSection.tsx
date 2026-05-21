"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Check, CheckCircle2, Star } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  useScrollAnimation();

  return (
    <section className="isolate overflow-hidden pt-24 pb-24 relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="z-10 md:px-8 max-w-7xl mr-auto ml-auto pr-6 pl-6 relative">
        <div className="text-center">
          <h2 className="sm:text-5xl text-4xl font-medium text-white tracking-tight animate-on-scroll" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}>
            Pricing Plans
          </h2>

          <div className="flex mt-6 gap-x-4 gap-y-4 items-center justify-center animate-on-scroll" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.2s both' }}>
            <span className="text-sm text-white/70">Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-white/10 p-1 ring-1 ring-white/15 transition"
            >
              <span
                className={`inline-flex h-6 w-6 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition will-change-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-0'
                }`}
              ></span>
            </button>
            <span className="text-sm text-white/70">
              Annual
              <span
                className="ml-2 inline-flex items-center rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300 ring-1 ring-amber-300/20"
                style={{ opacity: isAnnual ? 1 : 0.65 }}
              >
                Save 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mt-10 gap-x-6 gap-y-6">
          {/* Starter */}
          <div className="animate-on-scroll border-white/10 border rounded-3xl pt-6 pr-6 pb-6 pl-6 backdrop-blur-xl" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.3s both' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-white/60">Starter</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-4xl font-medium tracking-tight text-white">$0</div>
                  <div className="text-sm text-white/50">{isAnnual ? '/yr' : '/mo'}</div>
                </div>
              </div>
            </div>

            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium tracking-tight text-black hover:bg-white/90">
              Start Building
            </button>

            <ul className="mt-6 space-y-3 text-sm text-white/75">
              {['Up to 1K API calls per month', 'Basic data ingestion pipelines', 'Web console access', 'Community support', 'Basic monitoring & alerts'].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro (featured) */}
          <div className="border-white/10 border ring-amber-300/10 ring-1 rounded-3xl pt-2 pr-2 pb-2 pl-2 relative backdrop-blur-xl animate-on-scroll" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.4s both' }}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent">
              <div className="absolute inset-0">
                <Image
                  src="/images/4ca8123b-2b44-4ef6-9ce7-51db6671104c_800w_1.jpg"
                  alt="Premium background"
                  width={800}
                  height={600}
                  className="h-48 w-full rounded-t-2xl object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_0%,rgba(251,191,36,0.25),transparent_60%)]"></div>
              </div>

              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.18em] text-white/70">Professional</div>
                    <div className="mt-2 flex items-end gap-2">
                      <div className="text-4xl font-medium tracking-tight text-white">
                        {isAnnual ? '$470' : '$49'}
                      </div>
                      <div className="text-sm text-white/60">{isAnnual ? '/yr' : '/mo'}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-[10px] text-amber-300 ring-1 ring-amber-300/25">
                    <Star className="h-3.5 w-3.5" strokeWidth={2} /> Most Popular
                  </span>
                </div>

                <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-300 to-amber-400 px-4 py-3 text-sm font-medium tracking-tight text-black shadow-[0_10px_30px_rgba(251,191,36,0.25)] hover:from-amber-200 hover:to-amber-300">
                  Upgrade to Pro
                </button>

                <ul className="mt-6 space-y-3 text-sm text-white/85">
                  {['Unlimited API calls', 'Advanced reasoning models & orchestration', 'Performance analytics & insights', 'Custom workflows & integrations', 'Priority support with SLA'].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Enterprise */}
          <div className="animate-on-scroll border-white/10 border rounded-3xl pt-6 pr-6 pb-6 pl-6 backdrop-blur-xl" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.5s both' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-white/60">Enterprise</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-4xl font-medium tracking-tight text-white">Custom</div>
                  <div className="text-sm text-white/50">{isAnnual ? '/yr' : '/mo'}</div>
                </div>
              </div>
            </div>

            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium tracking-tight text-white/90 hover:bg-white/10">
              Contact Sales
            </button>

            <ul className="mt-6 space-y-3 text-sm text-white/75">
              {['On‑premises & private cloud deployment', 'Advanced security & compliance controls', 'Dedicated support team & onboarding', 'Team management & usage analytics', 'Custom model training & fine‑tuning'].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="animate-on-scroll text-xs text-white/50 text-center mt-6" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.6s both' }}>
          All plans include 14-day free trial. No setup fees.
        </p>
      </div>
    </section>
  );
}

