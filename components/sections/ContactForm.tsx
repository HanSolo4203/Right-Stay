"use client";

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  
  useScrollAnimation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section className="isolate overflow-hidden py-24 relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
            <h2 
              className="sm:text-4xl text-3xl font-medium text-white tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Let&apos;s Build Something Amazing
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 max-w-xl">
              Whether you&apos;re looking to deploy your first AI model or scale enterprise-wide intelligent systems, we&apos;re here to help you succeed.
            </p>

            <div className="mt-12 space-y-8">
              {[
                {
                  title: 'Sales Inquiries',
                  description: 'Interested in our platform? Let&apos;s discuss how Axiom can help your business.',
                  contact: 'sales@axiom.ai'
                },
                {
                  title: 'Technical Support',
                  description: 'Need help with implementation or have technical questions?',
                  contact: 'support@axiom.ai'
                },
                {
                  title: 'Partnership',
                  description: 'Want to partner with us? We&apos;d love to explore opportunities.',
                  contact: 'partners@axiom.ai'
                }
              ].map((item, index) => (
                <div key={index} className="border-l-2 border-white/20 pl-4">
                  <h3 className="text-base font-medium text-white/90">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{item.description}</p>
                  <a href={`mailto:${item.contact}`} className="mt-2 inline-block text-sm text-white/80 hover:text-white underline">
                    {item.contact}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" strokeWidth={2} />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-white/90">Message Sent!</h3>
                  <p className="mt-2 text-sm text-white/70">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white/90 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white/90 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                      <option value="" className="bg-black">Select a subject</option>
                      <option value="sales" className="bg-black">Sales Inquiry</option>
                      <option value="support" className="bg-black">Technical Support</option>
                      <option value="partnership" className="bg-black">Partnership</option>
                      <option value="other" className="bg-black">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium tracking-tight text-black hover:bg-white/90 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]"
                  >
                    Send Message
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
