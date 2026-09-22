import type { Metadata } from "next";
import SiteHeader from '@/components/sections/SiteHeader';
import ContactHero from '@/components/sections/ContactHero';
import ContactForm from '@/components/sections/ContactForm';
import Footer from '@/components/sections/Footer';
import PremiumBackgroundProvider from '@/components/premium/PremiumBackgroundProvider';
import PremiumPageBackdrop from '@/components/premium/PremiumPageBackdrop';
import { getPublicSiteContact } from '@/lib/public-site-settings';

export const metadata: Metadata = {
  title: "Contact Us | Right Stay Africa",
  description:
    "Get in touch with Right Stay Africa for bookings, hosting, tours, and property management across South Africa.",
};

export default async function ContactPage() {
  const contact = await getPublicSiteContact();

  return (
    <>
      <section className="isolate relative z-[1] min-h-svh overflow-x-clip">
        <SiteHeader />
        <ContactHero contact={contact} />
      </section>
      <PremiumPageBackdrop />
      <PremiumBackgroundProvider className="premium-content-stack">
        <div className="pt-[var(--premium-hero-overlap)]">
          <ContactForm />
        </div>
      </PremiumBackgroundProvider>
      <Footer contact={contact} />
    </>
  );
}
