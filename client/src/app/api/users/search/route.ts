import { NextResponse } from "next/server";
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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const matchedUsers = await prisma.user.findMany({
      where: {
        id: { not: decoded.id },
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 20,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true
      }
    });

    // Format for frontend
    const formatted = matchedUsers.map(u => ({
      _id: u.id,
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
      bio: u.bio,
      isOnline: false
    }));

    return NextResponse.json({ users: formatted });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
