import { NextRequest, NextResponse } from "next/server";
import { readJson, updateJson, INotification } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);

    const notifications = readJson<INotification[]>("notifications.json")
      .filter(n => n.userId === payload.userId);

    // Sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to 50
    const limited = notifications.slice(0, 50);

    return NextResponse.json({ notifications: limited });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    
    // Mark all as read
    updateJson<INotification[]>("notifications.json", (current) => {
      return current.map(n => {
        if (n.userId === payload.userId && !n.read) {
          return { ...n, read: true };
        }
        return n;
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
