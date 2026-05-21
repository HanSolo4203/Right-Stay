import type { Metadata } from "next";
import Header from '@/components/sections/Header';
import ContactHero from '@/components/sections/ContactHero';
import ContactForm from '@/components/sections/ContactForm';
import ContactInfo from '@/components/sections/ContactInfo';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: "Contact Us — Right Stay Africa",
  description:
    "Get in touch with Right Stay Africa for bookings, hosting, tours, and property management across South Africa.",
};

export default function ContactPage() {
  return (
    <>
      <section className="isolate min-h-[600px] overflow-hidden relative bg-black">
        <Header />
        <ContactHero />
      </section>
      <div className="bg-black">
        <ContactForm />
        <ContactInfo />
      </div>
      <Footer />
    </>
  );
}
