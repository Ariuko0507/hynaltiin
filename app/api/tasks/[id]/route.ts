import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  canTransitionTask,
  getNextFulfillmentRecipientRole,
  isOrgRole,
  isTaskStatus,
} from "@/lib/workflow-rules";
import {
  createAuditLog,
  createNotificationRow,
  createTaskNotificationRow,
  findActiveUserByRole,
  getRequestIp,
  getUserLite,
  makeCode,
} from "@/lib/server-workflow";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = Number(id);

    if (!Number.isFinite(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const { data: task, error: taskError } = await supabaseServer
      .from("tasks")
      .select(
        `
        *,
        creator:users!tasks_created_by_fkey(id, name, position),
        assignee:users!tasks_assigned_to_fkey(id, name, position),
        comments:task_comments(id, user_id, comment, is_official, created_at),
        workflow:task_workflow(id, from_status, to_status, action_by_user_id, action_date, comments)
      `,
      )
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: taskError?.message ?? "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = Number(id);

    if (!Number.isFinite(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const body = await request.json();
    const { actor_id, to_status, comment, response_text } = body as {
      actor_id?: number;
      to_status?: string;
      comment?: string;
      response_text?: string;
    };

    if (!actor_id || !to_status) {
      return NextResponse.json({ error: "actor_id and to_status are required" }, { status: 400 });
    }
    if (!isTaskStatus(to_status)) {
      return NextResponse.json({ error: "Invalid to_status" }, { status: 400 });
    }

    const actor = await getUserLite(actor_id);
    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }

    const { data: task, error: taskError } = await supabaseServer
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: taskError?.message ?? "Task not found" }, { status: 404 });
    }
    if (!isTaskStatus(task.status)) {
      return NextResponse.json({ error: "Task has unsupported status value" }, { status: 400 });
    }
    if (!canTransitionTask(task.status, to_status)) {
      return NextResponse.json(
        { error: `Invalid transition from ${task.status} to ${to_status}` },
        { status: 400 },
      );
    }

    if (to_status === "completed") {
      const cleanedResponse = response_text?.trim() || comment?.trim() || task.response_text?.trim();

      const { count: assigneeCommentCount, error: commentCountError } = await supabaseServer
        .from("task_comments")
        .select("id", { head: true, count: "exact" })
        .eq("task_id", taskId)
        .eq("user_id", task.assigned_to);

      if (commentCountError) {
        return NextResponse.json({ error: commentCountError.message }, { status: 500 });
      }

      if (task.requires_response && !cleanedResponse && (!assigneeCommentCount || assigneeCommentCount < 1)) {
        return NextResponse.json(
          { error: "Written response is required before completing this task" },
          { status: 400 },
        );
      }
    }

    if (comment?.trim()) {
      await supabaseServer.from("task_comments").insert({
        task_id: taskId,
        user_id: actor_id,
        comment: comment.trim(),
        is_official: true,
      });
    }

    const updatePayload: Record<string, unknown> = {
      status: to_status,
      updated_at: new Date().toISOString(),
    };
    if (response_text?.trim()) {
      updatePayload.response_text = response_text.trim();
      updatePayload.responded_at = new Date().toISOString();
    }
    if (to_status === "completed") {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data: updatedTask, error: updateError } = await supabaseServer
      .from("tasks")
      .update(updatePayload)
      .eq("id", taskId)
      .select()
      .single();

    if (updateError || !updatedTask) {
      return NextResponse.json({ error: updateError?.message ?? "Failed to update task" }, { status: 500 });
    }

    await supabaseServer.from("task_workflow").insert({
      task_id: taskId,
      from_status: task.status,
      to_status,
      action_by_user_id: actor_id,
      comments: comment ?? null,
    });

    if (to_status === "review" && task.created_by) {
      await createTaskNotificationRow({
        taskId,
        userId: task.created_by,
        notificationType: "review_required",
        message: `Даалгавар "${task.title}" шалгалтад ирлээ.`,
      });
      await createNotificationRow({
        userId: task.created_by,
        title: "Даалгавар шалгах шаардлагатай",
        message: `"${task.title}" даалгавар review төлөвт шилжлээ.`,
        type: "task",
        link: `/manager/tasks?taskId=${taskId}`,
      });
    }

    if (to_status === "corrected" && task.assigned_to) {
      await createTaskNotificationRow({
        taskId,
        userId: task.assigned_to,
        notificationType: "corrected",
        message: `Даалгавар "${task.title}" засвар руу буцлаа.`,
      });
      await createNotificationRow({
        userId: task.assigned_to,
        title: "Засвар шаардлагатай",
        message: `"${task.title}" даалгаварт засвар шаардлагатай байна.`,
        type: "task",
        link: `/leader/tasks?taskId=${taskId}`,
      });
    }

    if (to_status === "completed") {
      const assignee = task.assigned_to ? await getUserLite(task.assigned_to) : null;
      let sentTo: number | null = assignee?.manager_id ?? null;

      if (!sentTo && assignee && isOrgRole(assignee.position)) {
        const nextRole = getNextFulfillmentRecipientRole(assignee.position);
        if (nextRole) {
          const nextUser = await findActiveUserByRole(nextRole);
          sentTo = nextUser?.id ?? null;
        }
      }

      const { data: existingFulfillment } = await supabaseServer
        .from("fulfillments")
        .select("id")
        .eq("task_id", taskId)
        .limit(1)
        .maybeSingle();

      if (!existingFulfillment) {
        const fulfillmentCode = makeCode("FUL");
        const { data: newFulfillment } = await supabaseServer
          .from("fulfillments")
          .insert({
            fulfillment_code: fulfillmentCode,
            title: `${task.title} - fulfillment`,
            description: task.description ?? null,
            task_id: taskId,
            status: "sent",
            sent_by: task.assigned_to,
            sent_to: sentTo,
            sent_date: new Date().toISOString().slice(0, 10),
          })
          .select()
          .single();

        if (newFulfillment) {
          await supabaseServer.from("fulfillment_logs").insert({
            fulfillment_id: newFulfillment.id,
            action: "created_from_task_completion",
            created_by: actor_id,
          });

          await supabaseServer.from("fulfillment_history").insert({
            fulfillment_id: newFulfillment.id,
            saved_by: actor_id,
            snapshot: newFulfillment,
          });

          if (sentTo) {
            await createNotificationRow({
              userId: sentTo,
              title: "Шинэ биелэлт илгээгдлээ",
              message: `"${task.title}" даалгаврын биелэлт тан руу илгээгдлээ.`,
              type: "fulfillment",
              link: `/manager/fulfillment?fulfillmentId=${newFulfillment.id}`,
            });
          }
        }
      }

      if (task.created_by) {
        await createNotificationRow({
          userId: task.created_by,
          title: "Даалгавар дууслаа",
          message: `"${task.title}" даалгавар completed боллоо.`,
          type: "success",
          link: `/manager/tasks?taskId=${taskId}`,
        });
      }

      const manager = await findActiveUserByRole("manager");
      if (manager && manager.id !== task.created_by) {
        await createNotificationRow({
          userId: manager.id,
          title: "Даалгавар дууссан",
          message: `"${task.title}" даалгавар амжилттай дууслаа.`,
          type: "task",
          link: `/manager/tasks?taskId=${taskId}`,
        });
      }
    }

    await createAuditLog({
      userId: actor_id,
      action: "task_status_changed",
      objectType: "task",
      objectId: taskId,
      details: { from_status: task.status, to_status },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
