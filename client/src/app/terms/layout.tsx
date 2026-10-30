import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Terms of Service | Multiversal Communication Protocols",
  description:
    "Review the Terms of Service for using SpiderChat, covering acceptable use across all dimensions, anonymous rooms, and community standards.",
  canonical: "/terms",
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

