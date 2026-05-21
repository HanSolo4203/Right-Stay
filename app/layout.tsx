import type { Metadata, Viewport } from "next";
import { inter, manrope } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Right Stay Africa | Premium Accommodations & African Tours",
  description: "Your premier destination for exceptional short-term rentals across Africa. Discover luxury accommodations, curated tours, and professional property management services.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className={`${inter.className} min-h-screen bg-black font-sans text-white antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}

