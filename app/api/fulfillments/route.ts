import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  canSendFulfillmentUpward,
  isFulfillmentStatus,
  isOrgRole,
} from "@/lib/workflow-rules";
import {
  createAuditLog,
  createNotificationRow,
  getRequestIp,
  getUserLite,
  makeCode,
} from "@/lib/server-workflow";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = Number(searchParams.get("user_id"));
    const direction = searchParams.get("direction") ?? "inbox";
    const status = searchParams.get("status");

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "valid user_id is required" }, { status: 400 });
    }

    let query = supabaseServer
      .from("fulfillments")
      .select(
        `
        *,
        sender:users!fulfillments_sent_by_fkey(id, name, position),
        recipient:users!fulfillments_sent_to_fkey(id, name, position),
        task:tasks(id, task_code, title, status)
      `,
      )
      .order("created_at", { ascending: false });

    if (direction === "outbox") {
      query = query.eq("sent_by", userId);
    } else if (direction === "all") {
      query = query.or(`sent_to.eq.${userId},sent_by.eq.${userId}`);
    } else {
      query = query.eq("sent_to", userId);
    }

    if (status && isFulfillmentStatus(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ fulfillments: data ?? [] });
  } catch (error) {
    console.error("GET /api/fulfillments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      task_id,
      sent_by,
      sent_to,
      pdf_url,
      pdf_exported_at,
      status = "sent",
    } = body as {
      title?: string;
      description?: string;
      task_id?: number | null;
      sent_by?: number;
      sent_to?: number;
      pdf_url?: string | null;
      pdf_exported_at?: string | null;
      status?: string;
    };

    if (!title?.trim() || !sent_by || !sent_to) {
      return NextResponse.json(
        { error: "title, sent_by, and sent_to are required" },
        { status: 400 },
      );
    }
    if (status !== "sent") {
      return NextResponse.json({ error: "New fulfillment must start with status 'sent'" }, { status: 400 });
    }

    const sender = await getUserLite(sent_by);
    const recipient = await getUserLite(sent_to);
    if (!sender || !recipient) {
      return NextResponse.json({ error: "Sender or recipient not found" }, { status: 404 });
    }
    if (!isOrgRole(sender.position) || !isOrgRole(recipient.position)) {
      return NextResponse.json({ error: "Invalid role mapping on users" }, { status: 400 });
    }

    if (!canSendFulfillmentUpward(sender.position, recipient.position)) {
      return NextResponse.json(
        { error: "Fulfillment must follow upward flow (team_leader -> department_head -> manager -> director2 -> director1)" },
        { status: 400 },
      );
    }

    const fulfillmentCode = makeCode("FUL");
    const { data: fulfillment, error } = await supabaseServer
      .from("fulfillments")
      .insert({
        fulfillment_code: fulfillmentCode,
        title: title.trim(),
        description: description ?? null,
        task_id: task_id ?? null,
        status: "sent",
        sent_to,
        sent_by,
        sent_date: new Date().toISOString().slice(0, 10),
        pdf_url: pdf_url ?? null,
        pdf_exported_at: pdf_exported_at ?? null,
      })
      .select()
      .single();

    if (error || !fulfillment) {
      return NextResponse.json({ error: error?.message ?? "Failed to create fulfillment" }, { status: 500 });
    }

    await supabaseServer.from("fulfillment_logs").insert({
      fulfillment_id: fulfillment.id,
      action: "sent",
      created_by: sent_by,
    });

    await supabaseServer.from("fulfillment_history").insert({
      fulfillment_id: fulfillment.id,
      saved_by: sent_by,
      snapshot: fulfillment,
    });

    await createNotificationRow({
      userId: sent_to,
      title: "Шинэ биелэлт",
      message: `"${title.trim()}" биелэлт тан руу илгээгдлээ.`,
      type: "fulfillment",
      link: `/manager/fulfillment?fulfillmentId=${fulfillment.id}`,
    });

    await createAuditLog({
      userId: sent_by,
      action: "fulfillment_sent",
      objectType: "fulfillment",
      objectId: fulfillment.id,
      details: { sent_to, fulfillment_code: fulfillmentCode },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ fulfillment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fulfillments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
