export type WorkflowRole =
  | "director1"
  | "director2"
  | "manager"
  | "department_head"
  | "team_leader";

export type WorkflowRoleCard = {
  id: WorkflowRole;
  label: string;
  title: string;
  accent: string;
  responsibilities: string[];
};

export type PlatformFeature = {
  title: string;
  description: string;
  emphasis: string;
};

export type MeetingTypeOption = {
  id: string;
  label: string;
  audienceMode: "all" | "selected" | "hybrid";
  description: string;
};

export const workflowRoles: WorkflowRoleCard[] = [
  {
    id: "director1",
    label: "Director 1",
    title: "Final authority",
    accent: "bg-slate-950 text-white border-slate-800",
    responsibilities: [
      "Sees all data, tasks, and fulfillments.",
      "Provides final approval/rejection in upward flow.",
      "Owns final executive oversight.",
    ],
  },
  {
    id: "director2",
    label: "Director 2",
    title: "Second-level review",
    accent: "bg-violet-700/10 text-violet-950 border-violet-200",
    responsibilities: [
      "Reviews manager submissions.",
      "Returns items for correction when needed.",
      "Passes approved records to director1.",
    ],
  },
  {
    id: "manager",
    label: "Manager",
    title: "Task and meeting control center",
    accent: "bg-emerald-700/10 text-emerald-950 border-emerald-200",
    responsibilities: [
      "Distributes tasks to department heads.",
      "Creates meetings and records official reactions.",
      "Consolidates results and reports upward to director2.",
    ],
  },
  {
    id: "department_head",
    label: "Department Head",
    title: "Department-level owner",
    accent: "bg-sky-700/10 text-sky-950 border-sky-200",
    responsibilities: [
      "Assigns received tasks to team leader.",
      "Manages correction/re-verification cycle.",
      "Sends fulfillment upward to manager.",
    ],
  },
  {
    id: "team_leader",
    label: "Team Leader",
    title: "Execution and reporting",
    accent: "bg-amber-700/10 text-amber-950 border-amber-200",
    responsibilities: [
      "Executes assigned tasks and submits review.",
      "Handles corrected -> re_verified flow.",
      "Sends completed work upward as fulfillment.",
    ],
  },
];

export const approvalFlow = [
  "manager or department_head creates a task downward",
  "assignee moves new -> in_progress -> review",
  "reviewer may return corrected",
  "assignee submits re_verified",
  "task reaches completed after final check",
  "completed task becomes fulfillment and moves upward",
];

export const platformFeatures: PlatformFeature[] = [
  {
    title: "Mandatory written response",
    description: "Tasks that require response cannot be completed without written response/comment.",
    emphasis: "written response",
  },
  {
    title: "PDF exports",
    description: "Tasks and fulfillments can be exported as PDF and tracked by timestamp.",
    emphasis: "pdf export",
  },
  {
    title: "Overdue automation",
    description: "is_overdue is maintained automatically by trigger logic.",
    emphasis: "automation",
  },
  {
    title: "Notification-first workflow",
    description: "Task, fulfillment, and meeting events emit targeted notifications.",
    emphasis: "notifications",
  },
  {
    title: "Full audit trail",
    description: "Every major action is captured in audit logs with timestamp metadata.",
    emphasis: "audit",
  },
];

export const meetingTypeOptions: MeetingTypeOption[] = [
  {
    id: "regular",
    label: "Regular Meeting",
    audienceMode: "all",
    description: "Standard recurring meeting.",
  },
  {
    id: "urgent",
    label: "Urgent Meeting",
    audienceMode: "selected",
    description: "Fast-track meeting for urgent issues.",
  },
  {
    id: "reporting",
    label: "Reporting Meeting",
    audienceMode: "hybrid",
    description: "Review and reporting meeting.",
  },
  {
    id: "planning",
    label: "Planning Meeting",
    audienceMode: "hybrid",
    description: "Planning and roadmap meeting.",
  },
  {
    id: "evaluation",
    label: "Evaluation Meeting",
    audienceMode: "selected",
    description: "Performance and KPI review meeting.",
  },
];

export const audienceGroups = [
  "All Departments",
  "Management Department",
  "Finance Department",
  "Human Resources Department",
  "Marketing Department",
  "Technology Department",
  "Operations Department",
];
