import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Daily Bugle Tip Line | Feedback & Feature Requests",
  description:
    "Send intel, bug reports, and feedback straight to the Daily Bugle and SpiderChat engineers. Help shape the future of the multiverse.",
  canonical: "/feedback",
});

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

