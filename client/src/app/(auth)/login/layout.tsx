import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Agent Login | Access SpiderChat Network",
  description:
    "Log in to your SpiderChat account to access persistent direct messaging, your multiverse friend list, and custom hero profile.",
  canonical: "/login",
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

