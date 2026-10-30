import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Protocols | Ephemeral & Zero-Storage Messaging",
  description:
    "SpiderChat Privacy Protocols: Learn how our zero-server-storage, ephemeral room architecture guarantees privacy without tracking or message persistence.",
  canonical: "/privacy-policy",
});

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

