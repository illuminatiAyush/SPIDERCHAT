import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "System Status | Multiverse Network & Dimension Health",
  description:
    "Live operational status for SpiderChat real-time WebSocket relays, Alchemax servers, and dimension connectivity.",
  canonical: "/status",
});

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

