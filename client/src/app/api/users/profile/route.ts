import { NextRequest, NextResponse } from "next/server";
import { readJson, updateJson, IUser } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";
import { sanitizeInput } from "@/lib/sanitize";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    
    const rawBody = await req.json();
    const { displayName, bio, avatar } = sanitizeInput(rawBody);

    let updatedUser: IUser | null = null;

    updateJson<IUser[]>("users.json", (users) => {
      const userIndex = users.findIndex(u => u._id === payload.userId);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          displayName: displayName !== undefined ? displayName : users[userIndex].displayName,
          bio: bio !== undefined ? bio : users[userIndex].bio,
          avatar: avatar !== undefined ? avatar : users[userIndex].avatar,
          updatedAt: new Date().toISOString()
        };
        updatedUser = users[userIndex];
      }
      return users;
    });

    if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { passwordHash, ...userResponse } = updatedUser as IUser;
    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
