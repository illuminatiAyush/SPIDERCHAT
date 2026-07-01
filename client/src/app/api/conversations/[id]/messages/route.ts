import { NextRequest, NextResponse } from "next/server";
import { readJson, IConversation, IDirectMessage, IUser } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";

interface MessageDbFile {
  conversations: IConversation[];
  messages: IDirectMessage[];
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    
    // Ensure params is fully awaited
    const { id: conversationId } = await params;
    
    const db = readJson<MessageDbFile>("messages.json");
    const users = readJson<IUser[]>("users.json");

    const conv = db.conversations.find(c => c._id === conversationId);
    if (!conv || !conv.participants.includes(payload.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const query = searchParams.get("search");

    let messages = db.messages.filter(m => m.conversationId === conversationId);

    if (query) {
      const queryLower = query.toLowerCase();
      messages = messages.filter(m => m.content.toLowerCase().includes(queryLower));
    }

    // Sort by createdAt descending for pagination
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const paginated = messages.slice((page - 1) * limit, page * limit);

    // Populate senderId and replyTo
    const populated = paginated.map(m => {
      const sender = users.find(u => u._id === m.senderId);
      const replyMessage = m.replyTo ? db.messages.find(msg => msg._id === m.replyTo) : null;

      let replyPopulated = null;
      if (replyMessage) {
        const replySender = users.find(u => u._id === replyMessage.senderId);
        replyPopulated = {
          ...replyMessage,
          senderId: replySender ? {
            _id: replySender._id,
            username: replySender.username,
            displayName: replySender.displayName,
            avatar: replySender.avatar
          } : replyMessage.senderId
        };
      }

      return {
        ...m,
        senderId: sender ? {
          _id: sender._id,
          username: sender.username,
          displayName: sender.displayName,
          avatar: sender.avatar
        } : m.senderId,
        replyTo: replyPopulated
      };
    });

    return NextResponse.json({ messages: populated.reverse() });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
