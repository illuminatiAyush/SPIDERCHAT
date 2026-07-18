import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.id;

    // Fetch all accepted friends
    const friends = await prisma.user.findMany({
      where: {
        OR: [
          { sentRequests: { some: { receiverId: userId, status: "accepted" } } },
          { receivedRequests: { some: { senderId: userId, status: "accepted" } } }
        ]
      },
      select: { id: true, username: true, displayName: true, avatar: true }
    });

    const conversations = await Promise.all(friends.map(async (friend) => {
      const roomId = [userId, friend.id].sort().join("_");
      
      const lastMessage = await prisma.message.findFirst({
        where: { roomId },
        orderBy: { createdAt: "desc" }
      });

      // Mock unread count since we can't push schema changes right now
      const unreadCount = (lastMessage && lastMessage.senderId === friend.id) ? 1 : 0;

      return {
        _id: friend.id,
        participants: [
          { _id: userId, username: decoded.username },
          { _id: friend.id, username: friend.username, displayName: friend.displayName, avatar: friend.avatar, isOnline: true }
        ],
        lastMessage: lastMessage?.content || null,
        lastMessageAt: lastMessage?.createdAt || null,
        unreadCounts: { [userId]: unreadCount } 
      };
    }));

    conversations.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
