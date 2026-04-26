import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/notifications?user_id=123 - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const role = searchParams.get("role"); // director, manager, employee

    if (!userId && !role) {
      return NextResponse.json(
        { error: "user_id or role is required" },
        { status: 400 }
      );
    }

    let query = supabaseServer
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", parseInt(userId));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications: data || [] }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, message, type = "info", link } = body;

    if (!user_id || !title || !message) {
      return NextResponse.json(
        { error: "user_id, title, and message are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("notifications")
      .insert({
        user_id: parseInt(user_id),
        title,
        message,
        type,
        link,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

// PUT /api/notifications?id=123 - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { is_read } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("notifications")
      .update({ is_read })
      .eq("id", parseInt(id))
      .select()
      .single();

    if (error) {
      console.error("Error updating notification:", error);
      return NextResponse.json(
        { error: "Failed to update notification", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ notification: data }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications?id=123 - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("notifications")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      console.error("Error deleting notification:", error);
      return NextResponse.json(
        { error: "Failed to delete notification", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
