import { supabaseServer } from "@/lib/supabase-server";
import type { NotificationType, OrgRole } from "@/lib/workflow-rules";

export type UserLite = {
  id: number;
  name: string;
  email: string;
  position: OrgRole;
  manager_id: number | null;
  department_id: number | null;
};

export async function getUserLite(userId: number): Promise<UserLite | null> {
  const { data, error } = await supabaseServer
    .from("users")
    .select("id, name, email, position, manager_id, department_id")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }
  return data as UserLite;
}

export async function findActiveUserByRole(role: OrgRole): Promise<UserLite | null> {
  const { data, error } = await supabaseServer
    .from("users")
    .select("id, name, email, position, manager_id, department_id")
    .eq("position", role)
    .eq("status", "active")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as UserLite;
}

export async function createNotificationRow(params: {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
}) {
  await supabaseServer.from("notifications").insert({
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    link: params.link ?? null,
    is_read: false,
  });
}

export async function createTaskNotificationRow(params: {
  taskId: number;
  userId: number;
  notificationType:
    | "assigned"
    | "review_required"
    | "approved"
    | "rejected"
    | "due_soon"
    | "overdue"
    | "corrected"
    | "re_verified";
  message: string;
}) {
  await supabaseServer.from("task_notifications").insert({
    task_id: params.taskId,
    user_id: params.userId,
    notification_type: params.notificationType,
    message: params.message,
    is_read: false,
  });
}

export async function createAuditLog(params: {
  userId?: number | null;
  action: string;
  objectType?: string | null;
  objectId?: number | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}) {
  await supabaseServer.from("audit_logs").insert({
    user_id: params.userId ?? null,
    action: params.action,
    object_type: params.objectType ?? null,
    object_id: params.objectId ?? null,
    details: params.details ?? null,
    ip_address: params.ipAddress ?? null,
  });
}

export function makeCode(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString().slice(-6);
  return `${prefix}-${stamp}${rand}`;
}

export function getRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }
  return request.headers.get("x-real-ip");
}
