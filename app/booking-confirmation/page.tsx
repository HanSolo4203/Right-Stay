"use client";

import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import Link from 'next/link';
import { CheckCircle, Calendar, Mail, Home, ArrowRight } from 'lucide-react';

export default function BookingConfirmationPage() {
  return (
    <>
      <section className="isolate min-h-screen overflow-hidden relative bg-gradient-to-br from-blue-600 to-blue-800">
        <Header />
        
        <div className="relative z-10 mx-auto max-w-4xl px-6 md:px-8 py-24">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 
                className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Booking Request Submitted!
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Thank you for choosing Right Stay Africa. Your booking request has been received and is being processed.
              </p>
            </div>

            {/* What's Next Section */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">What happens next?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      1. Confirmation Email
                    </h3>
                    <p className="text-gray-600">
                      You&apos;ll receive a confirmation email shortly with your booking details and reference number.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      2. Booking Review
                    </h3>
                    <p className="text-gray-600">
                      Our team will review your booking and verify availability. This typically takes 1-2 hours during business hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      3. Final Confirmation
                    </h3>
                    <p className="text-gray-600">
                      Once confirmed, you&apos;ll receive payment instructions and check-in details for your stay.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 rounded-2xl p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Check your email inbox (and spam folder) for booking confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Free cancellation up to 48 hours before check-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>If you have questions, contact us at info@rightstayafrica.com</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
              <Link
                href="/accommodations"
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-colors duration-200 text-center"
              >
                Browse More Properties
              </Link>
              <Link
                href="/"
                className="flex-1 bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Return to Home
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

