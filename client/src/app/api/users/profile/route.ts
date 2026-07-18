import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rawBody = await req.json();
    const { displayName, bio, avatar } = rawBody; // In production, add validation

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar })
      }
    });

    return NextResponse.json({
      _id: updatedUser.id,
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
