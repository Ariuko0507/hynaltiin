"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "../_components/admin-shell";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  due: string;
  owner: string;
};

type LocalErrorTask = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedRole: "director" | "manager" | "employee";
  status: "new";
  dueDate: string;
};

type SystemErrorType = "database" | "api" | "validation" | "runtime";

type SystemErrorItem = {
  id: string;
  taskId: string;
  taskTitle: string;
  type: SystemErrorType;
  message: string;
  createdAt: string;
};

const ADMIN_ERROR_TASKS_KEY = "admin_error_tasks";
const ADMIN_ACTIVITY_LOGS_KEY = "admin_activity_logs";
const ADMIN_SYSTEM_ERRORS_KEY = "admin_system_errors";

async function getTasks(): Promise<TaskRow[]> {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("task_code, title, status, due_date, assigned_to")
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Supabase tasks error: ${error.message}`);
  }

  const userIds = Array.from(
    new Set(
      tasks
        ?.map((task) => task.assigned_to)
        .filter((id): id is number => typeof id === "number") || []
    )
  );

  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, name").in("id", userIds)
    : { data: [] };

  return (tasks || []).map((task) => ({
    id: task.task_code || "",
    title: task.title || "",
    status: task.status || "new",
    due: task.due_date ? String(task.due_date).slice(0, 10) : "",
    owner:
      users?.find((user) => user.id === task.assigned_to)?.name || "Тодорхойгүй",
  }));
}

export default function AdminTasksPage() {
  const statusLabels: Record<string, string> = {
    new: "Эхэлсэн",
    in_progress: "Явж байна",
    completed: "Зассан",
    cancelled: "Цуцлагдсан",
  };

  const statusStyles: Record<string, string> = {
    new: "bg-amber-100 text-amber-700",
    in_progress: "bg-sky-100 text-sky-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  const [dbTasks, setDbTasks] = useState<TaskRow[]>([]);
  const [localErrorTasks, setLocalErrorTasks] = useState<LocalErrorTask[]>([]);
  const [activityLogsCount, setActivityLogsCount] = useState(0);
  const [systemAlert, setSystemAlert] = useState("");
  const [systemErrors, setSystemErrors] = useState<SystemErrorItem[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [errorDateFilter, setErrorDateFilter] = useState("");
  const [errorTypeFilter, setErrorTypeFilter] = useState<"all" | SystemErrorType>("all");
  const [errorTaskFilter, setErrorTaskFilter] = useState("all");

  useEffect(() => {
    const initialErrors: SystemErrorItem[] = [
      {
        id: "SE-001",
        taskId: "T-1001",
        taskTitle: "Сургалтын материалыг шинэчлэх",
        type: "validation",
        message: "хадгалах үед алдаа гарсан",
        createdAt: "2026-04-27 09:35",
      },
      {
        id: "SE-002",
        taskId: "T-1002",
        taskTitle: "Харилцааны хичээлийн тайлан боловсруулах",
        type: "api",
        message: "API timeout: task status update failed",
        createdAt: "2026-04-27 10:12",
      },
      {
        id: "SE-003",
        taskId: "ERR-001",
        taskTitle: "Алдаа засах даалгавар",
        type: "runtime",
        message: "Unexpected null reference while rendering detail",
        createdAt: "2026-04-27 11:02",
      },
    ];

    try {
      const raw = localStorage.getItem(ADMIN_SYSTEM_ERRORS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SystemErrorItem[];
        if (Array.isArray(parsed)) {
          setSystemErrors(parsed);
        } else {
          setSystemErrors(initialErrors);
          localStorage.setItem(ADMIN_SYSTEM_ERRORS_KEY, JSON.stringify(initialErrors));
        }
      } else {
        setSystemErrors(initialErrors);
        localStorage.setItem(ADMIN_SYSTEM_ERRORS_KEY, JSON.stringify(initialErrors));
      }
    } catch {
      setSystemErrors(initialErrors);
      localStorage.setItem(ADMIN_SYSTEM_ERRORS_KEY, JSON.stringify(initialErrors));
    }

    const load = async () => {
      try {
        const fetched = await getTasks();
        if (fetched.length > 0) {
          setDbTasks(fetched);
        }
        setSystemAlert("");
      } catch {
        // Keep fallback tasks and show immediate warning to admin.
        const dbErrorItem: SystemErrorItem = {
          id: `SE-${Date.now()}`,
          taskId: "SYSTEM",
          taskTitle: "Task Service",
          type: "database",
          message: "Өгөгдлийн сангаас task ачааллахад алдаа гарсан",
          createdAt: new Date().toLocaleString("sv-SE").replace("T", " "),
        };
        setSystemErrors((current) => {
          const next = [dbErrorItem, ...current];
          localStorage.setItem(ADMIN_SYSTEM_ERRORS_KEY, JSON.stringify(next));
          return next;
        });
        setSystemAlert(
          "Анхаар: Өгөгдлийн сангаас task ачааллахад алдаа гарлаа. Түр fallback өгөгдөл харуулж байна."
        );
      }
    };

    load();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_ACTIVITY_LOGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown[];
      if (Array.isArray(parsed)) setActivityLogsCount(parsed.length);
    } catch {
      setActivityLogsCount(0);
    }
  }, []);

  useEffect(() => {
    const syncLocalTasks = () => {
      try {
        const raw = localStorage.getItem(ADMIN_ERROR_TASKS_KEY);
        if (!raw) {
          setLocalErrorTasks([]);
          return;
        }
        const parsed = JSON.parse(raw) as LocalErrorTask[];
        setLocalErrorTasks(Array.isArray(parsed) ? parsed : []);
      } catch {
        setLocalErrorTasks([]);
      }
    };

    syncLocalTasks();
    window.addEventListener("storage", syncLocalTasks);
    return () => window.removeEventListener("storage", syncLocalTasks);
  }, []);

  const tasks = useMemo(() => {
    const mappedLocalTasks: TaskRow[] = localErrorTasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      due: task.dueDate,
      owner: task.assignedTo,
    }));
    const merged = [...mappedLocalTasks, ...dbTasks];
    const uniqueById = new Map<string, TaskRow>();
    merged.forEach((task) => {
      if (!uniqueById.has(task.id)) {
        uniqueById.set(task.id, task);
      }
    });
    return Array.from(uniqueById.values());
  }, [localErrorTasks, dbTasks]);

  const today = new Date().toISOString().slice(0, 10);

  const pendingCount = tasks.filter((task) => task.status === "new" || task.status === "in_progress").length;
  const approvedCount = tasks.filter((task) => task.status === "completed").length;
  const rejectedCount = tasks.filter((task) => task.status === "cancelled").length;
  const overdueCount = tasks.filter((task) => task.due && task.due < today && task.status !== "completed").length;

  const filteredSystemErrors = useMemo(() => {
    return systemErrors.filter((item) => {
      const matchDate = !errorDateFilter || item.createdAt.startsWith(errorDateFilter);
      const matchType = errorTypeFilter === "all" || item.type === errorTypeFilter;
      const matchTask = errorTaskFilter === "all" || item.taskId === errorTaskFilter;
      return matchDate && matchType && matchTask;
    });
  }, [systemErrors, errorDateFilter, errorTypeFilter, errorTaskFilter]);

  const selectedTaskErrors = useMemo(() => {
    if (!selectedTaskId) return [];
    return systemErrors.filter((item) => item.taskId === selectedTaskId);
  }, [systemErrors, selectedTaskId]);

  const databaseErrorCount = useMemo(
    () => systemErrors.filter((item) => item.type === "database").length,
    [systemErrors]
  );
  const apiErrorCount = useMemo(
    () => systemErrors.filter((item) => item.type === "api").length,
    [systemErrors]
  );
  const runtimeErrorCount = useMemo(
    () => systemErrors.filter((item) => item.type === "runtime").length,
    [systemErrors]
  );
  const validationErrorCount = useMemo(
    () => systemErrors.filter((item) => item.type === "validation").length,
    [systemErrors]
  );

  const handleResolveSystemError = (errorId: string) => {
    const confirmed = window.confirm("Энэ error-г дууссан гэж тэмдэглээд жагсаалтаас устгах уу?");
    if (!confirmed) {
      return;
    }
    const next = systemErrors.filter((item) => item.id !== errorId);
    setSystemErrors(next);
    localStorage.setItem(ADMIN_SYSTEM_ERRORS_KEY, JSON.stringify(next));
  };

  return (
    <AdminShell
      currentPath="/admin/tasks"
      kicker="Tasks"
      title="Системийн хяналтын даалгаврууд"
      description="Үүрэг бүрийн төлөв, хугацаа болон хариуцагчийг ажилтны хуудсуудтай ижил загвараар эндээс хянах боломжтой."
      stats={[
        { label: "Нийт ажил", value: String(tasks.length) },
        { label: "Pending", value: String(pendingCount) },
        { label: "Approved", value: String(approvedCount) },
        { label: "Rejected", value: String(rejectedCount) },
      ]}
      action={
        <Link
          href="/admin/dashboard"
          className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Самбар луу буцах
        </Link>
      }
      noteText="Хугацаа хэтэрсэн ажлуудыг эхэлж хянаад, статус шинэчлэлтээ тогтмол хийж байгаарай."
    >
      {systemAlert ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {systemAlert}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Realtime Metrics</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">System error list-тэй уялдсан үзүүлэлт</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Нийт system errors</p>
              <p className="mt-1 text-2xl font-semibold text-rose-700">{systemErrors.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Filtered errors</p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">{filteredSystemErrors.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Database / API errors</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {databaseErrorCount} / {apiErrorCount}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Runtime / Validation</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {runtimeErrorCount} / {validationErrorCount}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-sm text-slate-500">Сонгосон task-н error count</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{selectedTaskErrors.length}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Task Detail Errors</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Task detail дээрх алдаанууд</h2>
          <p className="mt-2 text-sm text-slate-600">
            Task жагсаалтаас task сонгоход зөвхөн тухайн task-тай холбоотой system error-ууд энд харагдана.
          </p>
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Сонгосон task: <span className="font-semibold text-slate-950">{selectedTaskId || "Сонгоогүй"}</span>
          </div>

          <div className="mt-5 space-y-3">
            {selectedTaskErrors.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {selectedTaskId ? "Энэ task-д холбоотой system error байхгүй." : "Эхлээд task жагсаалтаас task сонгоно уу."}
              </div>
            ) : (
              selectedTaskErrors.map((item) => (
                <div key={`${item.id}-detail`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{item.id}</p>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.createdAt}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">System Error List</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">System error дэлгэрэнгүй list</h2>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {filteredSystemErrors.length} error
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input
            type="date"
            value={errorDateFilter}
            onChange={(event) => setErrorDateFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
          <select
            value={errorTypeFilter}
            onChange={(event) => setErrorTypeFilter(event.target.value as "all" | SystemErrorType)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="all">Бүх type</option>
            <option value="database">Database</option>
            <option value="api">API</option>
            <option value="validation">Validation</option>
            <option value="runtime">Runtime</option>
          </select>
          <select
            value={errorTaskFilter}
            onChange={(event) => setErrorTaskFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <option value="all">Бүх task</option>
            {Array.from(new Set(systemErrors.map((item) => item.taskId))).map((taskId) => (
              <option key={taskId} value={taskId}>
                {taskId}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredSystemErrors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-center text-slate-500">
                      Тохирох system error олдсонгүй.
                    </td>
                  </tr>
                ) : (
                  filteredSystemErrors.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 font-medium text-slate-950">{item.id}</td>
                      <td className="px-4 py-4 text-slate-700">
                        <p className="font-medium">{item.taskId}</p>
                        <p className="text-xs text-slate-500">{item.taskTitle}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{item.type}</td>
                      <td className="px-4 py-4 text-slate-700">{item.message}</td>
                      <td className="px-4 py-4 text-slate-700">{item.createdAt}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleResolveSystemError(item.id)}
                          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500"
                        >
                          Дууссан
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </AdminShell>
  );
}