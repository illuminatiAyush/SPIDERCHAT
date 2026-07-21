"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { socket } from "@/lib/socket";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalSocketListener() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.auth = { username: user.username, userId: user.id, token };
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
          icon: "/spider.png", // SpiderChat icon
        });
      }

      // Dispatch event to light up Messages icon
      window.dispatchEvent(new Event('spiderchat_new_message'));
    };

    const handleNotification = (data: any) => {
      addToast({
        type: "success",
        title: "New Alert",
        message: data.message || "You have a new notification",
      });
      // Dispatch DOM event to trigger bell in layout
      window.dispatchEvent(new Event('spiderchat_new_notification'));
    };

    const handleLiveUsersUpdate = (activeIds: string[]) => {
      window.dispatchEvent(new CustomEvent('spiderchat_live_users_update', { detail: activeIds }));
    };

    socket.on("dm_receive", handleDmReceive);
    socket.on("notification", handleNotification);
    socket.on("live_users_update", handleLiveUsersUpdate);

    return () => {
      socket.off("dm_receive", handleDmReceive);
      socket.off("notification", handleNotification);
      socket.off("live_users_update", handleLiveUsersUpdate);
    };
  }, [user, token, pathname, addToast, router]);

  return null;
}
