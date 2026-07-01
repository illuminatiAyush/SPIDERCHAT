"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { socket } from "@/lib/socket";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalSocketListener() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.auth = { username: user.username, userId: user.id };
      socket.connect();
    }

    const handleDmReceive = (message: any) => {
      // If we are currently in that conversation, don't show toast
      // The conversation page will mark it as read automatically
      if (pathname === `/dashboard/messages/${message.conversationId}`) {
        return;
      }

      // Show toast
      const senderName = message.senderId?.displayName || message.senderId?.username || "Someone";
      addToast({
        type: "message",
        title: `New Message from ${senderName}`,
        message: message.content,
        onClick: () => {
          router.push(`/dashboard/messages/${message.conversationId}`);
        },
      });

      // Show browser notification if permitted and hidden
      if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
        new Notification(`New Message from ${senderName}`, {
          body: message.content,
          icon: "/spider.png", // WebVerse icon
        });
      }
    };

    socket.on("dm_receive", handleDmReceive);

    return () => {
      socket.off("dm_receive", handleDmReceive);
    };
  }, [user, pathname, addToast, router]);

  return null;
}
