import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Recover Access Key | Password Reset",
  description:
    "Reset your SpiderChat account credentials using your security questions and recover access to your multiverse profile.",
  canonical: "/forgot-password",
  noIndex: true, // Utility recovery page should not be indexed in search results
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

