import { NextRequest, NextResponse } from "next/server";
import { updateJson, IConversation, IDirectMessage } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";

interface MessageDbFile {
  conversations: IConversation[];
  messages: IDirectMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    const userId = payload.userId as string;
    
    const { conversationId } = await req.json();

    let updated = false;

    updateJson<MessageDbFile>("messages.json", (db) => {
      const conv = db.conversations.find(c => c._id === conversationId);
      if (conv && conv.participants.includes(userId)) {
        if (!conv.unreadCounts) conv.unreadCounts = {};
        conv.unreadCounts[userId] = 0;

        // Update message statuses
        db.messages = db.messages.map(m => {
          if (m.conversationId === conversationId && m.senderId !== userId && m.status !== "seen") {
            return { ...m, status: "seen" };
          }
          return m;
        });

        updated = true;
      }
      return db;
    });

    if (!updated) {
      return NextResponse.json({ error: "Forbidden or conversation not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
