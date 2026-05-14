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
} from "@/lib/server-workflow";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const fulfillmentId = Number(id);
    if (!Number.isFinite(fulfillmentId)) {
      return NextResponse.json({ error: "Invalid fulfillment id" }, { status: 400 });
    }

    const body = await request.json();
    const { actor_id, status, next_sent_to, comment, pdf_url, pdf_exported_at } = body as {
      actor_id?: number;
      status?: string;
      next_sent_to?: number | null;
      comment?: string;
      pdf_url?: string | null;
      pdf_exported_at?: string | null;
    };

    if (!actor_id) {
      return NextResponse.json({ error: "actor_id is required" }, { status: 400 });
    }

    const actor = await getUserLite(actor_id);
    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }
    if (!isOrgRole(actor.position)) {
      return NextResponse.json({ error: "Actor has invalid role" }, { status: 400 });
    }

    const { data: fulfillment, error: fetchError } = await supabaseServer
      .from("fulfillments")
      .select("*")
      .eq("id", fulfillmentId)
      .single();

    if (fetchError || !fulfillment) {
      return NextResponse.json({ error: fetchError?.message ?? "Fulfillment not found" }, { status: 404 });
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    let actionLabel = "updated";

    if (pdf_url !== undefined) {
      patch.pdf_url = pdf_url;
      patch.pdf_exported_at = pdf_exported_at ?? new Date().toISOString();
      actionLabel = "pdf_exported";
    }

    if (status !== undefined) {
      if (!isFulfillmentStatus(status)) {
        return NextResponse.json({ error: "Invalid fulfillment status" }, { status: 400 });
      }

      if (status === "approved" || status === "rejected") {
        if (fulfillment.sent_to !== actor_id) {
          return NextResponse.json(
            { error: "Only current recipient can approve/reject this fulfillment" },
            { status: 403 },
          );
        }
      }

      if (status === "completed" && actor.position !== "director1") {
        return NextResponse.json(
          { error: "Only director1 can mark fulfillment as completed" },
          { status: 403 },
        );
      }

      if (status === "approved" && next_sent_to) {
        const recipient = await getUserLite(next_sent_to);
        if (!recipient || !isOrgRole(recipient.position)) {
          return NextResponse.json({ error: "Invalid next_sent_to user" }, { status: 400 });
        }

        if (!canSendFulfillmentUpward(actor.position, recipient.position)) {
          return NextResponse.json(
            { error: "Forwarding must follow upward flow chain" },
            { status: 400 },
          );
        }

        patch.status = "sent";
        patch.sent_by = actor_id;
        patch.sent_to = next_sent_to;
        patch.sent_date = new Date().toISOString().slice(0, 10);
        actionLabel = "approved_and_forwarded";

        await createNotificationRow({
          userId: next_sent_to,
          title: "Биелэлт илгээгдлээ",
          message: `"${fulfillment.title}" биелэлт тан руу дамжуулагдлаа.`,
          type: "fulfillment",
          link: `/manager/fulfillment?fulfillmentId=${fulfillmentId}`,
        });
      } else {
        patch.status = status;
        if (status === "completed") {
          patch.completed_date = new Date().toISOString().slice(0, 10);
        }
        actionLabel = status;
      }
    }

    const { data: updated, error: updateError } = await supabaseServer
      .from("fulfillments")
      .update(patch)
      .eq("id", fulfillmentId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message ?? "Failed to update fulfillment" }, { status: 500 });
    }

    await supabaseServer.from("fulfillment_logs").insert({
      fulfillment_id: fulfillmentId,
      action: actionLabel,
      created_by: actor_id,
    });

    await supabaseServer.from("fulfillment_history").insert({
      fulfillment_id: fulfillmentId,
      saved_by: actor_id,
      snapshot: updated,
    });

    if (status === "approved" && fulfillment.sent_by) {
      await createNotificationRow({
        userId: fulfillment.sent_by,
        title: "Биелэлт баталгаажлаа",
        message: `"${fulfillment.title}" биелэлт баталгаажлаа.`,
        type: "success",
        link: `/manager/fulfillment?fulfillmentId=${fulfillmentId}`,
      });
    }
    if (status === "rejected" && fulfillment.sent_by) {
      await createNotificationRow({
        userId: fulfillment.sent_by,
        title: "Биелэлт буцаагдлаа",
        message: `"${fulfillment.title}" биелэлт буцаагдлаа.`,
        type: "warning",
        link: `/manager/fulfillment?fulfillmentId=${fulfillmentId}`,
      });
    }

    await createAuditLog({
      userId: actor_id,
      action: "fulfillment_updated",
      objectType: "fulfillment",
      objectId: fulfillmentId,
      details: {
        status: status ?? null,
        next_sent_to: next_sent_to ?? null,
        comment: comment ?? null,
      },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ fulfillment: updated });
  } catch (error) {
    console.error("PATCH /api/fulfillments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
