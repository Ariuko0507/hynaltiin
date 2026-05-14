import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createAuditLog, getRequestIp, getUserLite } from "@/lib/server-workflow";
import { isMeetingReaction } from "@/lib/workflow-rules";

// PUT - Update a meeting (for manager reactions/approvals)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;
    const body = await request.json();
    const { status, manager_reaction, manager_comment, actor_id } = body as {
      status?: "scheduled" | "completed" | "cancelled";
      manager_reaction?: string;
      manager_comment?: string;
      actor_id?: number;
    };

    if (!actor_id || !Number.isFinite(actor_id)) {
      return NextResponse.json({ error: "actor_id is required" }, { status: 400 });
    }

    const actor = await getUserLite(actor_id);
    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }
    if (actor.position !== "manager") {
      return NextResponse.json({ error: "Only manager can react/update meetings" }, { status: 403 });
    }

    if (manager_reaction && !isMeetingReaction(manager_reaction)) {
      return NextResponse.json({ error: "manager_reaction must be approved, rejected, or noted" }, { status: 400 });
    }

    if (status && !["scheduled", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid meeting status" }, { status: 400 });
    }

    if (status === "completed") {
      const { count, error: recordingError } = await supabaseServer
        .from("meeting_recordings")
        .select("id", { count: "exact", head: true })
        .eq("meeting_id", meetingId);

      if (recordingError) {
        return NextResponse.json({ error: recordingError.message }, { status: 500 });
      }
      if (!count || count < 1) {
        return NextResponse.json(
          { error: "Meeting cannot be marked completed without a recording" },
          { status: 400 },
        );
      }
    }

    const { data, error } = await supabaseServer
      .from("meetings")
      .update({
        status,
        manager_reaction,
        manager_comment,
        manager_reaction_at: manager_reaction ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", meetingId)
      .select()
      .single();

    if (error) {
      console.error("Error updating meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog({
      userId: actor_id,
      action: "meeting_updated",
      objectType: "meeting",
      objectId: Number(meetingId),
      details: {
        status: status ?? null,
        manager_reaction: manager_reaction ?? null,
      },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ meeting: data });
  } catch (error) {
    console.error("Error in PUT /api/meetings/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;
    const actorId = Number(request.nextUrl.searchParams.get("actor_id"));

    if (!Number.isFinite(actorId)) {
      return NextResponse.json({ error: "actor_id query parameter is required" }, { status: 400 });
    }

    const actor = await getUserLite(actorId);
    if (!actor || actor.position !== "manager") {
      return NextResponse.json({ error: "Only manager can delete meetings" }, { status: 403 });
    }

    const { error } = await supabaseServer
      .from("meetings")
      .delete()
      .eq("id", meetingId);

    if (error) {
      console.error("Error deleting meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog({
      userId: actorId,
      action: "meeting_deleted",
      objectType: "meeting",
      objectId: Number(meetingId),
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/meetings/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
