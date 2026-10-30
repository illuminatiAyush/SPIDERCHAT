import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Security Protocols | Real-Time Encryption & Multiverse Defense",
  description:
    "Explore SpiderChat's multi-layered security protocols: WebSocket encryption, anti-DDOS mitigation, rate limiting, and ephemeral memory architectures.",
  canonical: "/security",
});

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

