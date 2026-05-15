import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createAuditLog, createNotificationRow, getRequestIp, getUserLite } from "@/lib/server-workflow";

type DispatchTaskRow = {
  id: string;
  task: string;
  due: string;
  owner: string;
};

type DispatchHeader = {
  mainTitle?: string;
  documentNumber?: string;
};

export async function GET(request: NextRequest) {
  try {
    const actorId = Number(request.nextUrl.searchParams.get("actor_id"));
    if (!Number.isFinite(actorId)) {
      return NextResponse.json({ error: "valid actor_id is required" }, { status: 400 });
    }

    const actor = await getUserLite(actorId);
    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }

    const { data, error } = await supabaseServer
      .from("users")
      .select("id, name, position")
      .in("position", ["director", "director1", "director2"])
      .neq("id", actorId)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    console.error("GET /api/meeting-task-dispatch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      actor_id,
      recipient_id,
      meeting_id,
      meeting_title,
      header,
      rows,
    } = body as {
      actor_id?: number;
      recipient_id?: number;
      meeting_id?: string;
      meeting_title?: string;
      header?: DispatchHeader;
      rows?: DispatchTaskRow[];
    };

    if (!actor_id || !recipient_id || !meeting_id || !meeting_title || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "actor_id, recipient_id, meeting_id, meeting_title, rows are required" },
        { status: 400 },
      );
    }

    const actor = await getUserLite(actor_id);
    const recipient = await getUserLite(recipient_id);
    if (!actor || !recipient) {
      return NextResponse.json({ error: "Actor or recipient not found" }, { status: 404 });
    }

    const compactRows = rows
      .slice(0, 5)
      .map((row) => `${row.id}. ${row.task} | ${row.due} | ${row.owner}`)
      .join("\n");

    const title = `Үүрэг даалгаврын хүснэгт: ${meeting_title}`;
    const message = [
      `${actor.name} танд "${meeting_title}" хурлын хүснэгт илгээлээ.`,
      header?.documentNumber ? `Баримтын дугаар: ${header.documentNumber}` : "",
      compactRows ? `\n${compactRows}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const targetTaskLink =
      recipient.position === "director1"
        ? "/director1/tasks"
        : recipient.position === "director2"
          ? "/director2/tasks"
          : "/manager/tasks";

    await createNotificationRow({
      userId: recipient_id,
      title,
      message,
      type: "task",
      link: `${targetTaskLink}?meetingId=${encodeURIComponent(meeting_id)}`,
    });

    await createAuditLog({
      userId: actor_id,
      action: "meeting_task_dispatched",
      objectType: "meeting",
      objectId: null,
      details: {
        meeting_id,
        meeting_title,
        recipient_id,
        row_count: rows.length,
      },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/meeting-task-dispatch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
