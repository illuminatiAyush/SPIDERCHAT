import { NextRequest, NextResponse } from "next/server";
import { readJson, updateJson, IConversation, IUser } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";
import { sanitizeInput } from "@/lib/sanitize";

const generateObjectId = () => Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');

interface ConversationDbFile {
  conversations: IConversation[];
  messages: any[];
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    const userId = payload.userId;

    const db = readJson<ConversationDbFile>("messages.json");
    const users = readJson<IUser[]>("users.json");

    // Filter conversations where participants contains userId
    const myConversations = db.conversations.filter(c => c.participants.includes(userId));

    // Populate participants
    const populated = myConversations.map(c => {
      const participantsInfo = c.participants.map(pId => {
        const u = users.find(user => user._id === pId);
        return u ? {
          _id: u._id,
          username: u.username,
          displayName: u.displayName,
          avatar: u.avatar,
          isOnline: u.isOnline,
          lastSeen: u.lastSeen
        } : null;
      }).filter(Boolean);

      return {
        ...c,
        participants: participantsInfo
      };
    });

    // Sort by lastMessageAt descending
    populated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return NextResponse.json({ conversations: populated });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    const userId = payload.userId;
    
    const rawBody = await req.json();
    const { targetUserId } = sanitizeInput(rawBody);

    if (userId === targetUserId) {
      return NextResponse.json({ error: "Cannot create conversation with yourself" }, { status: 400 });
    }

    const db = readJson<ConversationDbFile>("messages.json");
    const users = readJson<IUser[]>("users.json");

    // Find existing
    let conversation = db.conversations.find(c => 
      c.participants.includes(userId) && c.participants.includes(targetUserId) && c.participants.length === 2
    );

    if (!conversation) {
      const newId = generateObjectId();
      const newConv: IConversation = {
        _id: newId,
        participants: [userId, targetUserId],
        unreadCounts: { [userId]: 0, [targetUserId]: 0 },
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      updateJson<ConversationDbFile>("messages.json", (current) => {
        current.conversations.push(newConv);
        return current;
      });

      conversation = newConv;
    }

    // Populate participants
    const populatedParticipants = conversation.participants.map(pId => {
      const u = users.find(user => user._id === pId);
      return u ? {
        _id: u._id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen
      } : null;
    }).filter(Boolean);

    const populatedConversation = {
      ...conversation,
      participants: populatedParticipants
    };

    return NextResponse.json({ conversation: populatedConversation });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
