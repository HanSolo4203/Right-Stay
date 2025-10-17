"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { Home, Compass, Shield, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function FeaturesSection() {
  useScrollAnimation();

  return (
    <section className="isolate overflow-hidden min-h-[1000px] md:h-screen relative">
      <Image
        src="/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg"
        alt="Abstract 3D render background"
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
        style={{
          maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)'
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(255,255,255,0.06),transparent),linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.35))]"></div>

      <div className="z-10 flex flex-col md:px-8 h-full max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-16 pl-6 relative gap-x-10 gap-y-10 justify-center">
        <div className="max-w-3xl">
          <h2 className="sm:text-5xl lg:text-6xl animate-on-scroll text-4xl font-medium text-white tracking-tight drop-shadow-xl" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.2s both', fontFamily: 'Manrope, sans-serif' }}>
            Premium African Experiences. Exceptional Standards.
          </h2>
          <p className="sm:text-lg leading-relaxed animate-on-scroll text-base text-white/85 max-w-2xl mt-5" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.2s both' }}>
            Discover South Africa&apos;s finest accommodations, curated tours, and white-glove asset management—delivered with transparency, expertise, and unwavering quality.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 gap-x-6 gap-y-6 animate-on-scroll" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.6s both' }}>
          {/* Accommodation Excellence Card */}
          <div className="rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.18em] text-white/60">ACCOMMODATION EXCELLENCE</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/70 ring-1 ring-white/10">
                <Home className="h-3 w-3" strokeWidth={2} /> Active
              </span>
            </div>

            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Premium properties featured across <span className="text-emerald-400">50+ locations</span>
            </p>

            <div className="mt-6">
              <div className="relative h-24 w-full rounded-lg bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="absolute inset-x-0 bottom-6 h-[2px] bg-white/10"></div>
                <div className="absolute left-1/2 bottom-6 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]"></div>
                <div className="absolute inset-x-0 top-4 flex justify-between px-2 text-[10px] text-white/50">
                  <span>2025</span><span>2024</span><span>2023</span><span>2022</span><span>2021</span>
                </div>
              </div>
              <div className="mt-5">
                <div className="text-4xl font-medium tracking-tight text-white">R18.5M</div>
                <div className="text-sm text-white/60">Portfolio Value</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/70">
              From coastal villas to safari lodges, every property is hand-selected and verified for luxury standards.
            </p>
          </div>

          {/* Curated African Adventures Card */}
          <div className="rounded-3xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-2xl bg-white/5">
              <Image
                src="/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg"
                alt="Safari scene/Table Mountain/Wine Route landscape"
                width={800}
                height={600}
                className="h-56 w-full object-cover sm:h-64"
              />
              <div className="absolute inset-0 bg-[radial-gradient(60%_30%_at_50%_55%,rgba(163,230,53,0.25),transparent)]"></div>

              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-1 w-3/4 rounded bg-lime-400 shadow-[0_0_30px_rgba(132,204,22,0.45)]"></div>
              </div>

              {/* Grid lines */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-6">
                <div className="col-span-6 row-span-6 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:16.666%_100%,100%_16.666%]"></div>
              </div>

              <div className="absolute left-4 top-4 rounded-md bg-black/60 px-2 py-1 text-xs text-white/85 ring-1 ring-white/10">
                Perfect match confirmed
              </div>

              <div className="p-4">
                <div className="mt-2 text-base font-medium text-white/90">Curated African Adventures</div>
                <div className="text-sm text-white/60">Expert-Led Experiences</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/70 px-4 pb-4">
              Seamlessly pairing world-class accommodations with unforgettable tours—Big Five safaris, wine routes, cultural journeys, and coastal escapes.
            </p>
          </div>

          {/* Quality Standards Card */}
          <div className="rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
            <p className="text-lg leading-relaxed text-white/90">
              Achieving <span className="text-lime-400">98%</span> guest satisfaction rate, we deliver consistent excellence across every touchpoint.
            </p>

            <div className="mt-6">
              <div className="text-sm text-white/70">Quality Standards</div>

              <div className="mt-4 space-y-4">
                {[
                  { label: 'Property Verification', value: 100, color: 'from-emerald-400 to-emerald-500' },
                  { label: 'Guest Experience', value: 98, color: 'from-emerald-400 to-emerald-500' },
                  { label: 'Response Time', value: 95, color: 'from-sky-400 to-blue-500' }
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-white/80">{metric.label}</span>
                      <span className="text-base text-white/90">{metric.value === 100 ? '100%' : metric.value === 95 ? '<2hrs' : `${metric.value}%`}</span>
                    </div>
                    <div className="mt-2 h-3 w-full rounded-full bg-white/10">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${metric.color}`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs text-white/60">
              <Shield className="h-4 w-4 text-white/70" strokeWidth={2} />
              Premium service guaranteed
            </div>
          </div>
        </div>

        {/* Service Badges */}
        <div className="flex flex-wrap text-white/50 mt-4 gap-x-8 gap-y-4 items-center animate-on-scroll" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.8s both' }}>
          {[
            { icon: Home, name: 'Premium Stays' },
            { icon: Compass, name: 'Safari Tours' },
            { icon: TrendingUp, name: 'Wine Routes' },
            { icon: Shield, name: 'Asset Care' },
            { icon: CheckCircle, name: 'Concierge' }
          ].map((service) => (
            <span key={service.name} className="inline-flex items-center gap-2 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                <service.icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              {service.name}
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}

