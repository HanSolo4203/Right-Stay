import type { Metadata } from "next";
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: "Terms of Service | Right Stay Africa",
  description: "Terms of service for Right Stay Africa - Your premier destination for exceptional short-term rentals across Africa.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using Right Stay Africa services, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Booking Terms</h2>
              <p className="text-gray-600 mb-4">
                All bookings are subject to availability and confirmation. Payment terms, cancellation policies, 
                and check-in/check-out times are specified for each property.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Guest Responsibilities</h2>
              <p className="text-gray-600 mb-4">
                Guests are responsible for the care and security of the property during their stay. Any damages 
                or excessive cleaning required will be charged to the guest.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                Right Stay Africa shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of our services.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-4">
                For questions about these terms, please contact us at:
              </p>
              <p className="text-gray-600">
                Email: legal@rightstayafrica.com<br />
                Phone: +27 XXX XXX XXXX
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
