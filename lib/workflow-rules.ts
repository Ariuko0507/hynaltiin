export const ORG_ROLES = [
  "director1",
  "director2",
  "manager",
  "department_head",
  "team_leader",
] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

export const TASK_STATUSES = [
  "new",
  "in_progress",
  "review",
  "corrected",
  "re_verified",
  "completed",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  new: ["in_progress"],
  in_progress: ["review"],
  review: ["corrected", "completed"],
  corrected: ["re_verified"],
  re_verified: ["completed"],
  completed: [],
};

export const FULFILLMENT_STATUSES = [
  "sent",
  "approved",
  "rejected",
  "completed",
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const FULFILLMENT_FLOW: OrgRole[] = [
  "team_leader",
  "department_head",
  "manager",
  "director2",
  "director1",
];

export const NOTIFICATION_TYPES = [
  "info",
  "warning",
  "alert",
  "success",
  "comment",
  "meeting",
  "task",
  "fulfillment",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const MEETING_REACTIONS = ["approved", "rejected", "noted"] as const;
export type MeetingReaction = (typeof MEETING_REACTIONS)[number];

export function isOrgRole(value: string): value is OrgRole {
  return ORG_ROLES.includes(value as OrgRole);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function isFulfillmentStatus(value: string): value is FulfillmentStatus {
  return FULFILLMENT_STATUSES.includes(value as FulfillmentStatus);
}

export function isNotificationType(value: string): value is NotificationType {
  return NOTIFICATION_TYPES.includes(value as NotificationType);
}

export function isMeetingReaction(value: string): value is MeetingReaction {
  return MEETING_REACTIONS.includes(value as MeetingReaction);
}

export function canCreateTaskByRole(role: string): role is "manager" | "department_head" {
  return role === "manager" || role === "department_head";
}

export function canAssignTaskDownward(creatorRole: OrgRole, assigneeRole: OrgRole): boolean {
  if (creatorRole === "manager") {
    return assigneeRole === "department_head";
  }
  if (creatorRole === "department_head") {
    return assigneeRole === "team_leader";
  }
  return false;
}

export function canTransitionTask(fromStatus: TaskStatus, toStatus: TaskStatus): boolean {
  return TASK_TRANSITIONS[fromStatus].includes(toStatus);
}

export function getNextFulfillmentRecipientRole(currentRole: OrgRole): OrgRole | null {
  const idx = FULFILLMENT_FLOW.indexOf(currentRole);
  if (idx === -1 || idx === FULFILLMENT_FLOW.length - 1) {
    return null;
  }
  return FULFILLMENT_FLOW[idx + 1];
}

export function canSendFulfillmentUpward(senderRole: OrgRole, recipientRole: OrgRole): boolean {
  return getNextFulfillmentRecipientRole(senderRole) === recipientRole;
}

export function getRoleLevel(role: OrgRole): number {
  return ORG_ROLES.indexOf(role) + 1;
}
