import type { Metadata, Viewport } from "next";
import { inter, manrope } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Right Stay Africa | Premium Accommodations & African Tours",
  description: "Your premier destination for exceptional short-term rentals across Africa. Discover luxury accommodations, curated tours, and professional property management services.",
  metadataBase: new URL("https://rightstayafrica.com"),
  icons: {
    icon: [
      { url: "/favicon.ico?v=serif2", sizes: "48x48" },
      { url: "/favicon.svg?v=serif2", type: "image/svg+xml" },
      { url: "/favicon-48x48.png?v=serif2", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=serif2", sizes: "180x180" }],
    shortcut: "/favicon.ico?v=serif2",
  },
  openGraph: {
    title: "Right Stay Africa | Premium Accommodations & African Tours",
    description:
      "Your premier destination for exceptional short-term rentals across Africa. Discover luxury accommodations, curated tours, and professional property management services.",
    url: "https://rightstayafrica.com",
    siteName: "Right Stay Africa",
    type: "website",
    images: [
      {
        url: "/og-landing.jpg",
        width: 1200,
        height: 630,
        alt: "Right Stay Africa landing page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-landing.jpg"],
  },
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

