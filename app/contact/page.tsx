import type { Metadata } from "next";
import ScrollAnimationProvider from '@/components/providers/ScrollAnimationProvider';
import Header from '@/components/sections/Header';
import ContactHero from '@/components/sections/ContactHero';
import ContactForm from '@/components/sections/ContactForm';
import Footer from '@/components/sections/Footer';
import { getPublicSiteContact } from '@/lib/public-site-settings';

export const metadata: Metadata = {
  title: "Contact Us — Right Stay Africa",
  description:
    "Get in touch with Right Stay Africa for bookings, hosting, tours, and property management across South Africa.",
};

export default async function ContactPage() {
  const contact = await getPublicSiteContact();

  return (
    <>
      <section className="isolate min-h-[600px] overflow-hidden relative bg-black">
        <Header />
        <ContactHero contact={contact} />
      </section>
      <div className="bg-black">
        <ScrollAnimationProvider>
          <ContactForm />
        </ScrollAnimationProvider>
      </div>
      <Footer contact={contact} />
    </>
  );
}
