import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

// PATCH /api/user/notifications/[id] — mark as read
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid notification ID" }, { status: 400 });
    }

    await Notification.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH notification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notification" },
      { status: 500 }
    );
  }
}
