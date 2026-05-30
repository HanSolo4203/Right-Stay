"use client";

import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import PremiumBackgroundProvider from '@/components/premium/PremiumBackgroundProvider';
import PremiumPageBackdrop from '@/components/premium/PremiumPageBackdrop';
import Link from 'next/link';
import { CheckCircle2, Calendar, Mail, Home, ArrowRight, Sparkles } from 'lucide-react';
import { getPublicSiteContactEmail } from '@/lib/site-contact';

const steps = [
  {
    icon: Mail,
    title: 'Request confirmation email',
    description:
      "You'll receive an email shortly confirming we received your request — not a final booking confirmation.",
  },
  {
    icon: Calendar,
    title: 'Booking review',
    description:
      'Our team will review your booking and verify availability. This typically takes 1–2 hours during business hours.',
  },
  {
    icon: CheckCircle2,
    title: 'Final confirmation',
    description:
      "Once confirmed, you'll receive payment instructions and check-in details for your stay.",
  },
] as const;

const importantNotes = [
  'Check your email inbox (and spam folder) for booking confirmation',
  'Free cancellation up to 48 hours before check-in',
] as const;

export default function BookingConfirmationPage() {
  const contactEmail = getPublicSiteContactEmail();

  return (
    <>
      <PremiumPageBackdrop />

      <section className="isolate relative z-[1] min-h-[420px] sm:min-h-[480px] overflow-x-hidden">
        <Header />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 pb-10 sm:pb-12 flex flex-col items-center text-center">
          <p
            className="text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both' }}
          >
            Request received
          </p>
          <div
            className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/25"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.15s both' }}
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-400" strokeWidth={2} />
          </div>
          <h1
            className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight max-w-3xl"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.25s both' }}
          >
            Booking Request Submitted
          </h1>
          <p
            className="mt-5 text-base sm:text-lg leading-relaxed text-white/75 max-w-2xl px-2"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.35s both' }}
          >
            Thank you. Your request is in our queue — this is not yet a confirmed booking. We&apos;ll review
            availability and be in touch shortly.
          </p>
        </div>
      </section>

      <PremiumBackgroundProvider>
        <section className="relative isolate pb-24">
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 md:px-8 -mt-4 sm:-mt-6">
          <div
            className="animate-on-scroll rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 sm:px-8 sm:py-9 md:px-10 md:py-10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.45s both' }}
          >
            <div className="flex items-center gap-2 text-sm font-medium leading-normal text-white/70">
              <Sparkles className="h-4 w-4 text-right-stay-400" strokeWidth={1.5} />
              What happens next
            </div>

            <ol className="mt-8 space-y-0">
              {steps.map((step, index) => (
                <li key={step.title} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0">
                  {index < steps.length - 1 ? (
                    <span
                      className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent"
                      aria-hidden
                    />
                  ) : null}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <step.icon className="h-5 w-5 text-right-stay-400" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-medium text-white/95">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div
            className="animate-on-scroll mt-6 rounded-3xl border border-right-stay-500/20 bg-right-stay-500/[0.08] p-6 sm:p-8 backdrop-blur-xl"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.55s both' }}
          >
            <h3 className="flex items-center gap-2 text-base font-medium text-white/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                <Home className="h-4 w-4 text-right-stay-400" strokeWidth={1.5} />
              </span>
              Important information
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {importantNotes.map((note) => (
                <li key={note} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-right-stay-400" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-right-stay-400" aria-hidden />
                <span>
                  If you have questions, contact us
                  {contactEmail ? (
                    <>
                      {' '}
                      at{' '}
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-white/90 font-medium underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white/60 transition-colors"
                      >
                        {contactEmail}
                      </a>
                    </>
                  ) : (
                    ' through our website'
                  )}
                </span>
              </li>
            </ul>
          </div>

          <div
            className="animate-on-scroll mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.65s both' }}
          >
            <Link
              href="/accommodations"
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/10 hover:border-white/25"
            >
              Browse more properties
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-medium tracking-tight text-black hover:bg-white/90 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] transition-colors"
            >
              Return to home
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          </div>
        </section>
      </PremiumBackgroundProvider>

      <div className="relative z-[1]">
        <Footer />
      </div>
    </>
  );
}
