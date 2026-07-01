import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.id;
    const body = await req.json();
    const { conversationId } = body; // This is the friend's ID

    if (!conversationId) return NextResponse.json({ error: "conversationId is required" }, { status: 400 });

    const roomId = [userId, conversationId].sort().join("_");

    await prisma.message.updateMany({
      where: {
        roomId,
        senderId: conversationId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
