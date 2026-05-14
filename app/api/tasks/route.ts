import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  canAssignTaskDownward,
  canCreateTaskByRole,
  isOrgRole,
} from "@/lib/workflow-rules";
import {
  createAuditLog,
  createNotificationRow,
  createTaskNotificationRow,
  getRequestIp,
  getUserLite,
  makeCode,
} from "@/lib/server-workflow";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = Number(searchParams.get("user_id"));
    const status = searchParams.get("status");
    const scope = searchParams.get("scope") ?? "assigned";

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "valid user_id is required" }, { status: 400 });
    }

    let query = supabaseServer
      .from("tasks")
      .select(
        `
        *,
        creator:users!tasks_created_by_fkey(id, name, position),
        assignee:users!tasks_assigned_to_fkey(id, name, position),
        department:departments(id, name, code)
      `,
      )
      .order("created_at", { ascending: false });

    if (scope === "created") {
      query = query.eq("created_by", userId);
    } else if (scope === "all") {
      query = query.or(`created_by.eq.${userId},assigned_to.eq.${userId}`);
    } else {
      query = query.eq("assigned_to", userId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: data ?? [] });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      priority = "medium",
      due_date,
      created_by,
      assigned_to,
      department_id,
      team_id,
      requires_response = true,
    } = body as {
      title?: string;
      description?: string;
      priority?: "low" | "medium" | "high" | "critical";
      due_date?: string;
      created_by?: number;
      assigned_to?: number;
      department_id?: number | null;
      team_id?: number | null;
      requires_response?: boolean;
    };

    if (!title?.trim() || !created_by || !assigned_to) {
      return NextResponse.json(
        { error: "title, created_by, and assigned_to are required" },
        { status: 400 },
      );
    }

    const creator = await getUserLite(created_by);
    const assignee = await getUserLite(assigned_to);

    if (!creator || !assignee) {
      return NextResponse.json({ error: "Creator or assignee not found" }, { status: 404 });
    }
    if (!isOrgRole(creator.position) || !isOrgRole(assignee.position)) {
      return NextResponse.json({ error: "Invalid role mapping on users" }, { status: 400 });
    }
    if (!canCreateTaskByRole(creator.position)) {
      return NextResponse.json(
        { error: "Only manager or department_head can create tasks" },
        { status: 403 },
      );
    }
    if (!canAssignTaskDownward(creator.position, assignee.position)) {
      return NextResponse.json(
        { error: "Task assignment must follow downward chain (manager->department_head, department_head->team_leader)" },
        { status: 400 },
      );
    }

    const taskCode = makeCode("TASK");
    const { data: task, error: taskError } = await supabaseServer
      .from("tasks")
      .insert({
        task_code: taskCode,
        title: title.trim(),
        description: description ?? null,
        priority,
        status: "new",
        due_date: due_date ?? null,
        created_by,
        assigned_to,
        department_id: department_id ?? assignee.department_id,
        team_id: team_id ?? null,
        requires_response: requires_response !== false,
      })
      .select()
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: taskError?.message ?? "Failed to create task" }, { status: 500 });
    }

    await supabaseServer.from("task_workflow").insert({
      task_id: task.id,
      from_status: "new",
      to_status: "new",
      action_by_user_id: created_by,
      comments: "Task created",
    });

    await createTaskNotificationRow({
      taskId: task.id,
      userId: assigned_to,
      notificationType: "assigned",
      message: `Шинэ даалгавар: ${title.trim()}`,
    });

    await createNotificationRow({
      userId: assigned_to,
      title: "Шинэ даалгавар",
      message: `Танд "${title.trim()}" даалгавар оноогдлоо.`,
      type: "task",
      link: `/manager/tasks?taskId=${task.id}`,
    });

    await createAuditLog({
      userId: created_by,
      action: "task_created",
      objectType: "task",
      objectId: task.id,
      details: {
        task_code: taskCode,
        assigned_to,
        requires_response: task.requires_response,
      },
      ipAddress: getRequestIp(request),
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
