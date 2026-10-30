import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Join the Spider-Society | Create Account",
  description:
    "Register for SpiderChat. Create your hero alias to unlock 1-on-1 private messaging, friend requests, and secure multiversal communication.",
  canonical: "/signup",
});

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

