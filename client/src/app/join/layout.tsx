import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Join Dimension | Real-Time Multiverse Rooms",
  description:
    "Instantly warp into any SpiderChat dimension or room using a secret key code or anonymous alias. Zero setup, ephemeral messaging.",
  canonical: "/join",
});

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

