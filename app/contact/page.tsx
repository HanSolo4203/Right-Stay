import type { Metadata } from "next";
import Header from '@/components/sections/Header';
import ContactHero from '@/components/sections/ContactHero';
import ContactForm from '@/components/sections/ContactForm';
import ContactInfo from '@/components/sections/ContactInfo';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: "Contact Us — Axiom Intelligence",
  description: "Get in touch with Axiom. Let's discuss how we can help you build intelligent systems that scale.",
};

export default function ContactPage() {
  return (
    <>
      <section className="isolate min-h-[600px] overflow-hidden relative">
        <Header />
        <ContactHero />
      </section>
      <ContactForm />
      <ContactInfo />
      <Footer />
    </>
  );
}

