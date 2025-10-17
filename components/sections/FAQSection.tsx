"use client";

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const faqs = [
  {
    question: 'How quickly can I deploy AI models to production?',
    answer: "With Axiom's modular architecture, most teams deploy their first AI workflow within hours. Our pre-built pipelines and safety guardrails accelerate time-to-production by 3x compared to building from scratch."
  },
  {
    question: 'What security measures protect my data?',
    answer: 'All data is encrypted in transit and at rest with enterprise-grade security. You maintain full control over data retention, access, and deletion. Enterprise plans include on-premises deployment options for maximum security.'
  },
  {
    question: 'Which AI models and frameworks are supported?',
    answer: 'Axiom supports all major language models (GPT, Claude, Gemini), computer vision frameworks (PyTorch, TensorFlow), and cloud providers (AWS, Azure, GCP). Custom model integration is available for Enterprise customers.'
  },
  {
    question: 'How does performance monitoring work?',
    answer: 'Real-time dashboards track accuracy, latency, cost, and model drift. Automated alerts notify you of performance issues, and built-in A/B testing helps optimize results across diverse environments and use cases.'
  },
  {
    question: 'Can Axiom integrate with existing systems?',
    answer: 'Yes. Axiom provides REST APIs, webhooks, and pre-built connectors for popular databases, CRMs, and workflow tools. Our platform adapts to your existing infrastructure without requiring major changes.'
  },
  {
    question: 'What support options are available?',
    answer: 'All users access community forums and documentation. Professional plans include priority support with SLA guarantees. Enterprise customers receive dedicated account managers and onboarding assistance.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  useScrollAnimation();

  return (
    <section className="isolate overflow-hidden pt-24 pb-24 relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <h3 className="sm:text-4xl animate-on-scroll text-3xl font-medium text-white tracking-tight text-center" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}>
          Frequently Asked Questions
        </h3>

        <div className="grid md:grid-cols-2 animate-on-scroll mt-10 gap-x-4 gap-y-4" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.2s both' }}>
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
              <button
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="text-sm md:text-base text-white/85">{faq.question}</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                  {openIndex === index ? (
                    <Minus className="h-4 w-4 text-white/70" strokeWidth={2} />
                  ) : (
                    <Plus className="h-4 w-4 text-white/70" strokeWidth={2} />
                  )}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-sm text-white/70">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

