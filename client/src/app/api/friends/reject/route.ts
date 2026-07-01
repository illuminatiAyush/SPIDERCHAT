import { NextRequest, NextResponse } from "next/server";
import { updateJson, IFriendRequest } from "@/lib/jsonDb";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAuthToken(token);
    
    const { requestId } = await req.json();

    let found = false;

    updateJson<IFriendRequest[]>("friends.json", (requests) => {
      const idx = requests.findIndex(r => r._id === requestId && r.receiver === payload.userId && r.status === "pending");
      if (idx !== -1) {
        requests[idx].status = "rejected";
        found = true;
      }
      return requests;
    });

    if (!found) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject friend request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
