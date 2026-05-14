import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createAuditLog, getRequestIp } from "@/lib/server-workflow";

// GET /api/comments?fulfillment_id=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fulfillmentIdParam = searchParams.get("fulfillment_id");
    let fulfillmentId = Number(fulfillmentIdParam);

    if (!Number.isFinite(fulfillmentId) && fulfillmentIdParam) {
      const { data: fulfillmentByCode } = await supabaseServer
        .from("fulfillments")
        .select("id")
        .eq("fulfillment_code", fulfillmentIdParam)
        .maybeSingle();
      if (fulfillmentByCode?.id) {
        fulfillmentId = fulfillmentByCode.id;
      }
    }

    if (!Number.isFinite(fulfillmentId)) {
      return NextResponse.json(
        { error: "valid fulfillment_id is required" },
        { status: 400 }
      );
    }

    const { data: comments, error } = await supabaseServer
      .from("fulfillment_comments")
      .select(
        `
        *,
        author:users!fulfillment_comments_author_id_fkey(id, name, position)
      `,
      )
      .eq('fulfillment_id', fulfillmentId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    interface CommentRow {
      id: number;
      fulfillment_id: number;
      author_id: number;
      text: string;
      parent_id: number | null;
      created_at: string;
      author: {
        id: number;
        name: string;
        position: string;
      } | null;
    }

    const typedComments = (comments || []) as CommentRow[];
    const parentComments = typedComments.filter((c) => !c.parent_id);
    const replies = typedComments.filter((c) => c.parent_id);

    const organizedComments = parentComments.map((parent: CommentRow) => ({
      ...parent,
      replies: replies.filter((reply: CommentRow) => reply.parent_id === parent.id),
    }));

    return NextResponse.json({ comments: organizedComments });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Add new comment or reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fulfillment_id, author_id, text, parent_id, actor_id, author } = body as {
      fulfillment_id?: number | string;
      author_id?: number;
      text?: string;
      parent_id?: number | null;
      actor_id?: number | null;
      author?: string;
    };

    let resolvedFulfillmentId: number | null = null;
    if (typeof fulfillment_id === "number" && Number.isFinite(fulfillment_id)) {
      resolvedFulfillmentId = fulfillment_id;
    }
    if (!resolvedFulfillmentId && typeof fulfillment_id === "string" && fulfillment_id.trim()) {
      const maybeAsNumber = Number(fulfillment_id);
      if (Number.isFinite(maybeAsNumber)) {
        resolvedFulfillmentId = maybeAsNumber;
      } else {
        const { data: fulfillmentByCode } = await supabaseServer
          .from("fulfillments")
          .select("id")
          .eq("fulfillment_code", fulfillment_id)
          .maybeSingle();
        resolvedFulfillmentId = fulfillmentByCode?.id ?? null;
      }
    }

    let resolvedAuthorId = author_id ?? actor_id ?? null;
    if (!resolvedAuthorId && author?.trim()) {
      const { data: byName } = await supabaseServer
        .from("users")
        .select("id")
        .ilike("name", `%${author.trim()}%`)
        .limit(1)
        .maybeSingle();
      resolvedAuthorId = byName?.id ?? null;
    }

    if (!resolvedFulfillmentId || !resolvedAuthorId || !text?.trim()) {
      return NextResponse.json(
        { error: "fulfillment_id, author_id, and text are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("fulfillment_comments")
      .insert({
        fulfillment_id: resolvedFulfillmentId,
        author_id: resolvedAuthorId,
        text: text.trim(),
        parent_id: parent_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting comment:", error);
      return NextResponse.json(
        { error: "Failed to add comment" },
        { status: 500 }
      );
    }

    await createAuditLog({
      userId: actor_id ?? resolvedAuthorId,
      action: "fulfillment_comment_created",
      objectType: "fulfillment_comment",
      objectId: data.id,
      details: { fulfillment_id: resolvedFulfillmentId, parent_id: parent_id ?? null },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/comments?id=123 - Delete comment by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const actorId = Number(searchParams.get("actor_id"));

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid id format" },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabaseServer
      .from("fulfillment_comments")
      .select("id, parent_id, fulfillment_id")
      .eq('id', numericId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Comment not found", details: fetchError?.message },
        { status: 404 }
      );
    }

    if (!existing.parent_id) {
      await supabaseServer
        .from("fulfillment_comments")
        .delete()
        .eq("parent_id", numericId);
    }

    const { data, error } = await supabaseServer
      .from("fulfillment_comments")
      .delete()
      .eq("id", numericId)
      .select();

    if (error) {
      console.error("Error deleting comment:", error);
      return NextResponse.json(
        { error: "Failed to delete comment", details: error.message, code: error.code },
        { status: 500 }
      );
    }

    await createAuditLog({
      userId: Number.isFinite(actorId) ? actorId : null,
      action: "fulfillment_comment_deleted",
      objectType: "fulfillment_comment",
      objectId: numericId,
      details: { deleted_rows: data?.length ?? 0 },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ success: true, deleted: data?.length || 0 }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in DELETE:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}

// PUT /api/comments?id=123 - Update comment by ID
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { text, actor_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("fulfillment_comments")
      .update({ text: text.trim() })
      .eq("id", parseInt(id, 10))
      .select()
      .single();

    if (error) {
      console.error("Error updating comment:", error);
      return NextResponse.json(
        { error: "Failed to update comment" },
        { status: 500 }
      );
    }

    await createAuditLog({
      userId: actor_id ?? null,
      action: "fulfillment_comment_updated",
      objectType: "fulfillment_comment",
      objectId: Number(id),
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ comment: data }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
