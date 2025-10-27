import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UG Mart - Affordable Electronics & Online Shopping",
  description:
    "Shop a wide range of electronics, fashions and more at unbeatable prices. Experience seamless online shopping with UG Mart today!",
  metadataBase: new URL("https://ecomerce-2-p66h.vercel.app"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "NnCHKbX_mKbC2Pt0D10rEHLCeHrfcEZcQyw9vY_VtbU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "UG Mart",
    url: "https://ecomerce-2-p66h.vercel.app",
    description:
      "Shop a wide range of electronics, fashions and more at unbeatable prices.",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://ecomerce-2-p66h.vercel.app/products?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* JSON-LD Schema */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics */}
        <Script
          strategy="beforeInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-8S99M189QN"
        />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8S99M189QN', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <Header />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
