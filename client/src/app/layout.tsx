import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";


export const metadata: Metadata = {
  title: "SpiderChat",
  description: "Enter the Multiverse of Conversations.",
  icons: {
    icon: "/spider.png",
  },
  verification: {
    google: "googleba862447bb8adbe6",
  },
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
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Bebas+Neue&family=Fredoka:wght@300..700&family=Permanent+Marker&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AnnouncementBanner />
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
