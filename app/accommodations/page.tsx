import Header from '@/components/sections/Header';
import AccommodationCards from '@/components/sections/AccommodationCards';
import Footer from '@/components/sections/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AccommodationsPage() {
  return (
    <>
      <section className="isolate min-h-[400px] overflow-hidden relative bg-gradient-to-br from-blue-600 to-blue-800">
        <Header />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1
            className="sm:text-6xl lg:text-7xl text-5xl font-medium text-white tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Premium Accommodations
          </h1>
          <p className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl mt-6">
            Browse our carefully curated collection of luxury properties across South Africa. Each accommodation is verified for quality, comfort, and exceptional experiences.
          </p>
        </div>
      </section>
      <AccommodationCards />
      <Footer />
    </>
  );
}

