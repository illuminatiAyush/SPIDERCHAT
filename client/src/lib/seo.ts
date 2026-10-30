import type { Metadata } from "next";

export const siteConfig = {
  name: "SpiderChat",
  shortName: "SpiderChat",
  title: "SpiderChat — Real-Time Multiverse Chat & Ephemeral Rooms",
  description:
    "Enter the Multiverse of Conversations. SpiderChat is a high-speed, privacy-first web messaging platform featuring ephemeral public rooms, encrypted direct messaging, and iconic comic-book aesthetics.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://the-web-verse.vercel.app"),
  ogImage: "/spider.png",
  author: "Ayush Kumar (illuminatiAyush)",
  links: {
    github: "https://github.com/illuminatiAyush/SPIDERCHAT",
  },
  keywords: [
    "SpiderChat",
    "Spider-Verse chat",
    "real-time messaging",
    "ephemeral chat rooms",
    "anonymous chat",
    "temporary chat room",
    "encrypted direct messages",
    "comic book UI",
    "Socket.IO web chat",
    "multiverse chat",
    "Next.js chat app",
  ],
};

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  canonical = "/",
  noIndex = false,
}: ConstructMetadataProps = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : siteConfig.title;

  const canonicalUrl = new URL(canonical, siteConfig.url).toString();

  return {
    title: fullTitle,
    description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author, url: siteConfig.links.github }],
    creator: siteConfig.author,
    publisher: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: `${siteConfig.name} - Multiverse Chat`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@illuminatiAyush",
    },
    icons: {
      icon: "/spider.png",
      apple: "/spider.png",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

