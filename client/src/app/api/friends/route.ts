import { NextRequest, NextResponse } from "next/server";
import { readJson, IUser, IFriendRequest } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    const userId = payload.userId;

    const users = readJson<IUser[]>("users.json");
    const requests = readJson<IFriendRequest[]>("friends.json");

    // Populate helper
    const populateUser = (id: string) => {
      const u = users.find(user => user._id === id);
      return u ? {
        _id: u._id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen
      } : null;
    };

    const pendingRequests = requests
      .filter(r => r.receiver === userId && r.status === "pending")
      .map(r => ({
        ...r,
        sender: populateUser(r.sender)
      }));

    const sentRequests = requests
      .filter(r => r.sender === userId && r.status === "pending")
      .map(r => ({
        ...r,
        receiver: populateUser(r.receiver)
      }));
    
    const acceptedRequests = requests
      .filter(r => (r.sender === userId || r.receiver === userId) && r.status === "accepted")
      .map(r => ({
        ...r,
        sender: populateUser(r.sender),
        receiver: populateUser(r.receiver)
      }));

    const friends = acceptedRequests.map(r => {
      // Return the other user
      return r.sender?._id === userId ? r.receiver : r.sender;
    }).filter(Boolean);

    return NextResponse.json({ pendingRequests, sentRequests, friends });
  } catch (error) {
    console.error("Fetch friends error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
