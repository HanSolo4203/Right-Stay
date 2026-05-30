"use client";

import { useEffect, useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { getPublicSiteContactEmail } from '@/lib/site-contact';
import {
  CONTACT_SUBJECT_OPTIONS,
  createEmptyPropertyHostingDetails,
  isPropertyHostingSubject,
  type PropertyHostingDetails,
} from '@/lib/contact-form';
import PropertyHostingFields from '@/components/sections/PropertyHostingFields';

const inputClassName =
  'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20';

const selectClassName =
  'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20';

const labelClassName = 'block text-sm font-medium text-white/90 mb-2';

export default function ContactForm() {
  const contactEmail = getPublicSiteContactEmail();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [propertyData, setPropertyData] = useState<PropertyHostingDetails>(
    createEmptyPropertyHostingDetails
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showPropertySection = isPropertyHostingSubject(formData.subject);

  useEffect(() => {
    if (!showPropertySection) return;

    setPropertyData((prev) => ({
      ...prev,
      ownerName: prev.ownerName || formData.name,
      ownerEmail: prev.ownerEmail || formData.email,
    }));
  }, [showPropertySection, formData.name, formData.email]);

  const resetForm = () => {
    setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    setPropertyData(createEmptyPropertyHostingDetails());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyHosting: showPropertySection ? propertyData : undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Unable to send your message. Please try again.'
        );
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        resetForm();
      }, 3000);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to send your message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section className="isolate overflow-hidden py-24 relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
            <h2 className="font-display sm:text-4xl text-3xl font-medium text-white tracking-tight">
              How Can We Help?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 max-w-xl">
              Reach out for guest bookings, property management, curated tours, or partnership opportunities across South
              Africa.
            </p>

            <div className="mt-12 space-y-8">
              {[
                {
                  title: 'Guest & Booking Enquiries',
                  description: 'Questions about availability, amenities, or your upcoming stay.',
                },
                {
                  title: 'Host & Property Owners',
                  description: 'List your property or discuss asset management with our team.',
                },
                {
                  title: 'Tours & Partnerships',
                  description: 'Plan a curated experience or explore collaboration opportunities.',
                },
              ].map((item, index) => (
                <div key={index} className="border-l-2 border-white/20 pl-4">
                  <h3 className="text-base font-medium text-white/90">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{item.description}</p>
                  {contactEmail ? (
                    <a href={`mailto:${contactEmail}`} className="mt-2 inline-block text-sm text-white/80 hover:text-white underline">
                      {contactEmail}
                    </a>
                  ) : null}
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
                    <label htmlFor="name" className={labelClassName}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClassName}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className={labelClassName}>
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className={labelClassName}>
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className={selectClassName}
                    >
                      <option value="" className="bg-black">Select a subject</option>
                      {CONTACT_SUBJECT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-black">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showPropertySection ? (
                    <PropertyHostingFields data={propertyData} onChange={handlePropertyChange} />
                  ) : null}

                  <div>
                    <label htmlFor="message" className={labelClassName}>
                      Message{showPropertySection ? '' : ' *'}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required={!showPropertySection}
                      value={formData.message}
                      onChange={handleChange}
                      rows={showPropertySection ? 3 : 5}
                      className={`${inputClassName} resize-none`}
                      placeholder={
                        showPropertySection
                          ? 'Optional general message...'
                          : 'Tell us about your project...'
                      }
                    />
                  </div>

                  {error ? (
                    <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium tracking-tight text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]"
                  >
                    {submitting ? (
                      <>
                        Sending...
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4" strokeWidth={1.5} />
                      </>
                    )}
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
