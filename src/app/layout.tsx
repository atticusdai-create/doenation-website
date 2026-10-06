import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SafetyBar } from "@/components/SafetyBar";
import { QuickExit } from "@/components/QuickExit";
import { site } from "@/lib/site";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "DoeNation | A safe place to begin again",
    template: "%s | DoeNation",
  },
  description: site.description,
  // Visitors may be on a shared or monitored device; keep previews neutral.
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "DoeNation | A safe place to begin again",
    description: site.description,
    images: [{ url: "/images/hero.jpg", width: 2000, height: 1400 }],
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#131019" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: "+1-720-341-8844",
  areaServed: "Aurora, Colorado",
  description: site.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <SafetyBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <QuickExit />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
