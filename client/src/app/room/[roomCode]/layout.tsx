import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Live Chat Room",
  noIndex: true,
});

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

