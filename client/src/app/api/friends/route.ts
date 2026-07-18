import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.id;

    // Fetch received pending requests
    const pendingRequests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "pending" },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    });

    // Fetch sent pending requests
    const sentRequests = await prisma.friendRequest.findMany({
      where: { senderId: userId, status: "pending" },
      include: {
        receiver: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    });

    // Fetch accepted friendships
    const acceptedRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: "accepted"
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        receiver: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    });

    const friends = acceptedRequests.map(r => {
      const friend = r.senderId === userId ? r.receiver : r.sender;
      return {
        _id: friend.id,
        id: friend.id,
        username: friend.username,
        displayName: friend.displayName,
        avatar: friend.avatar,
        // Online status is now handled purely by sockets on frontend
        isOnline: false 
      };
    }).filter(Boolean);

    // Format requests to match frontend expectations (handling _id vs id)
    const formattedPending = pendingRequests.map(r => ({
      _id: r.id,
      id: r.id,
      sender: { ...r.sender, _id: r.sender.id }
    }));

    const formattedSent = sentRequests.map(r => ({
      _id: r.id,
      id: r.id,
      receiver: { ...r.receiver, _id: r.receiver.id }
    }));

    return NextResponse.json({ 
      pendingRequests: formattedPending, 
      sentRequests: formattedSent, 
      friends,
      requests: formattedPending // Legacy support if needed
    });
  } catch (error) {
    console.error("Fetch friends error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
