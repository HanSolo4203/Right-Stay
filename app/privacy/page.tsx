import type { Metadata } from "next";
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: "Privacy Policy | Right Stay Africa",
  description: "Privacy policy for Right Stay Africa - Your premier destination for exceptional short-term rentals across Africa.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us, such as when you create an account, make a booking, 
                or contact us for support.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to provide, maintain, and improve our services, process bookings, 
                and communicate with you.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                except as described in this privacy policy.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <p className="text-gray-600">
                Email: privacy@rightstayafrica.com<br />
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
