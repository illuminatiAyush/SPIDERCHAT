import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { constructMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  ...constructMetadata(),
  verification: {
    google: "googleba862447bb8adbe6",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: "SpiderChat",
      description: siteConfig.description,
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: "SpiderChat",
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/spider.png`,
        width: 512,
        height: 512,
      },
      sameAs: [siteConfig.links.github],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteConfig.url}/#application`,
      name: "SpiderChat",
      applicationCategory: "CommunicationApplication",
      operatingSystem: "All modern web browsers",
      offers: {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      description:
        "Real-time web messaging platform inspired by the Spider-Verse with ephemeral public rooms, encrypted direct messaging, and privacy-first architecture.",
      url: siteConfig.url,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Bebas+Neue&family=Fredoka:wght@300..700&family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <AnnouncementBanner />
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
