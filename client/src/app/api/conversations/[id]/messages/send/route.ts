import { NextRequest, NextResponse } from "next/server";
import { readJson, updateJson, IConversation, IDirectMessage, IUser } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";
import { sanitizeInput } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";

const generateObjectId = () => Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');

interface MessageDbFile {
  conversations: IConversation[];
  messages: IDirectMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const { isRateLimited } = rateLimit(req, 100, 60000); // 100 messages per minute
    if (isRateLimited) {
      return NextResponse.json({ error: "Rate limit exceeded. Too many messages." }, { status: 429 });
    }

    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    const userId = payload.userId as string;

    const rawBody = await req.json();
    const { conversationId, content, type = "text", replyTo } = sanitizeInput(rawBody);

    if (!conversationId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = readJson<MessageDbFile>("messages.json");
    const users = readJson<IUser[]>("users.json");

    // Verify user is part of the conversation
    const convIndex = db.conversations.findIndex(c => c._id === conversationId);
    if (convIndex === -1 || !db.conversations[convIndex].participants.includes(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messageId = generateObjectId();
    const newMessage: IDirectMessage = {
      _id: messageId,
      conversationId,
      senderId: userId,
      content,
      type,
      replyTo: replyTo || undefined,
      status: "sent",
      reactions: [],
      createdAt: new Date().toISOString()
    };

    updateJson<MessageDbFile>("messages.json", (current) => {
      // Find the conversation again inside the transaction context
      const c = current.conversations.find(conv => conv._id === conversationId);
      if (c) {
        c.lastMessage = content.length > 50 ? content.substring(0, 50) + "..." : content;
        c.lastMessageAt = new Date().toISOString();
        c.updatedAt = new Date().toISOString();
        
        if (!c.unreadCounts) c.unreadCounts = {};
        for (const participant of c.participants) {
          const pid = participant.toString();
          if (pid !== userId) {
            c.unreadCounts[pid] = (c.unreadCounts[pid] || 0) + 1;
          }
        }
      }
      current.messages.push(newMessage);
      return current;
    });

    // Populate the response message
    const sender = users.find(u => u._id === userId);
    
    let replyPopulated = null;
    if (replyTo) {
      const replyMessage = db.messages.find(m => m._id === replyTo);
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
    }

    const populated = {
      ...newMessage,
      senderId: sender ? {
        _id: sender._id,
        username: sender.username,
        displayName: sender.displayName,
        avatar: sender.avatar
      } : userId,
      replyTo: replyPopulated
    };

    return NextResponse.json({ message: populated });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
