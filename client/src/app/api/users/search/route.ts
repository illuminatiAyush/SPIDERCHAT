import { NextRequest, NextResponse } from "next/server";
import { readJson, IUser } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const queryLower = query.toLowerCase();
    const allUsers = readJson<IUser[]>("users.json");

    // Find users excluding the current user, matching query
    const matchedUsers = allUsers
      .filter(u => u._id !== payload.userId && (
        u.username.toLowerCase().includes(queryLower) ||
        (u.displayName && u.displayName.toLowerCase().includes(queryLower))
      ))
      .slice(0, 20)
      .map(u => ({
        _id: u._id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
        bio: u.bio,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen
      }));

    return NextResponse.json({ users: matchedUsers });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
