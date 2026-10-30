import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Spider Support | Guy in the Chair Multiverse Help",
  description:
    "Need technical assistance or connection debugging in the Web-Verse? Contact SpiderChat support across Earth-616 and beyond.",
  canonical: "/support",
});

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

