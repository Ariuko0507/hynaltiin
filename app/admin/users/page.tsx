"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../_components/admin-shell";

type RoleName = "admin" | "director" | "manager" | "employee";
type UserStatus = "active" | "inactive" | "suspended";

type ManagedUser = {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  department: string;
  status: UserStatus;
};

type ErrorTask = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedRole: Exclude<RoleName, "admin">;
  status: "new";
  dueDate: string;
  createdAt: string;
};

type ActivityLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
};

type RolePolicy = {
  role: Exclude<RoleName, "admin">;
  permissions: string;
};

type InstructionVersion = {
  version: number;
  content: string;
  updatedAt: string;
};

type SystemInstruction = {
  id: string;
  title: string;
  targetRole: Exclude<RoleName, "admin">;
  content: string;
  version: number;
  history: InstructionVersion[];
};

const ADMIN_ERROR_TASKS_KEY = "admin_error_tasks";
const ADMIN_ACTIVITY_LOGS_KEY = "admin_activity_logs";
const ADMIN_USERS_STORE_KEY = "admin_users_store";
const ADMIN_POLICIES_KEY = "admin_role_policies";
const ADMIN_INSTRUCTIONS_KEY = "admin_instructions";

const roleLabel: Record<RoleName, string> = {
  admin: "Админ",
  director: "Директор",
  manager: "Менежер",
  employee: "Ажилтан",
};

const statusLabel: Record<UserStatus, string> = {
  active: "Идэвхтэй",
  inactive: "Идэвхгүй",
  suspended: "Түр түдгэлзсэн",
};

const statusClasses: Record<UserStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-700",
  suspended: "bg-rose-100 text-rose-700",
};

const roleClasses: Record<RoleName, string> = {
  admin: "bg-indigo-100 text-indigo-700",
  director: "bg-sky-100 text-sky-700",
  manager: "bg-amber-100 text-amber-700",
  employee: "bg-emerald-100 text-emerald-700",
};

const nowString = () => new Date().toLocaleString("sv-SE").replace("T", " ");

const initialUsers: ManagedUser[] = [
  { id: 1, name: "Админ Бат", email: "admin@example.com", role: "admin", department: "Админ", status: "active" },
  { id: 2, name: "Директор Энх", email: "director@example.com", role: "director", department: "Удирдах", status: "active" },
  { id: 3, name: "Менежер Тэмүүжин", email: "manager@example.com", role: "manager", department: "Менежмент", status: "active" },
  { id: 4, name: "Ажилтан Сарнай", email: "employee@example.com", role: "employee", department: "Үйл ажиллагаа", status: "active" },
];

const initialPolicies: RolePolicy[] = [
  { role: "director", permissions: "Батлах, тайлан харах, department-н гүйцэтгэл хянах" },
  { role: "manager", permissions: "Task хуваарилах, баг хянах, анхан шатны шалгалт хийх" },
  { role: "employee", permissions: "Task гүйцэтгэх, тайлан оруулах, биелэлт илгээх" },
];

const defaultTaskForm = { targetUserId: 2, title: "", description: "", dueDate: "" };
const defaultCreateUser = { name: "", email: "", role: "employee" as Exclude<RoleName, "admin">, department: "" };
const defaultInstruction = { title: "", targetRole: "employee" as Exclude<RoleName, "admin">, content: "" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [errorTasks, setErrorTasks] = useState<ErrorTask[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [policies, setPolicies] = useState<RolePolicy[]>(initialPolicies);
  const [instructions, setInstructions] = useState<SystemInstruction[]>([]);
  const [taskForm, setTaskForm] = useState(defaultTaskForm);
  const [createUserForm, setCreateUserForm] = useState(defaultCreateUser);
  const [instructionForm, setInstructionForm] = useState(defaultInstruction);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const writeLog = (action: string, target: string) => {
    const next: ActivityLog = {
      id: `LOG-${Date.now()}`,
      actor: "Админ Бат",
      action,
      target,
      createdAt: nowString(),
    };
    const merged = [next, ...activityLogs].slice(0, 80);
    setActivityLogs(merged);
    localStorage.setItem(ADMIN_ACTIVITY_LOGS_KEY, JSON.stringify(merged));
  };

  useEffect(() => {
    const rawUsers = localStorage.getItem(ADMIN_USERS_STORE_KEY);
    if (rawUsers) {
      try {
        const parsed = JSON.parse(rawUsers) as ManagedUser[];
        if (Array.isArray(parsed) && parsed.length > 0) setUsers(parsed);
      } catch {
        // keep defaults
      }
    }

    const rawErrors = localStorage.getItem(ADMIN_ERROR_TASKS_KEY);
    if (rawErrors) {
      try {
        const parsed = JSON.parse(rawErrors) as ErrorTask[];
        if (Array.isArray(parsed)) setErrorTasks(parsed);
      } catch {
        // no-op
      }
    }

    const rawLogs = localStorage.getItem(ADMIN_ACTIVITY_LOGS_KEY);
    if (rawLogs) {
      try {
        const parsed = JSON.parse(rawLogs) as ActivityLog[];
        if (Array.isArray(parsed)) setActivityLogs(parsed);
      } catch {
        // no-op
      }
    }

    const rawPolicies = localStorage.getItem(ADMIN_POLICIES_KEY);
    if (rawPolicies) {
      try {
        const parsed = JSON.parse(rawPolicies) as RolePolicy[];
        if (Array.isArray(parsed) && parsed.length > 0) setPolicies(parsed);
      } catch {
        // no-op
      }
    }

    const rawInstructions = localStorage.getItem(ADMIN_INSTRUCTIONS_KEY);
    if (rawInstructions) {
      try {
        const parsed = JSON.parse(rawInstructions) as SystemInstruction[];
        if (Array.isArray(parsed)) setInstructions(parsed);
      } catch {
        // no-op
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ADMIN_USERS_STORE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(ADMIN_POLICIES_KEY, JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem(ADMIN_INSTRUCTIONS_KEY, JSON.stringify(instructions));
  }, [instructions]);

  const reviewableUsers = useMemo(
    () => users.filter((user) => user.role === "director" || user.role === "manager" || user.role === "employee"),
    [users]
  );

  const roleStats = useMemo(
    () => ({
      directors: users.filter((user) => user.role === "director").length,
      managers: users.filter((user) => user.role === "manager").length,
      employees: users.filter((user) => user.role === "employee").length,
      inactive: users.filter((user) => user.status !== "active").length,
    }),
    [users]
  );

  const handleRoleChange = (userId: number, nextRole: RoleName) => {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== userId || user.role === "admin") return user;
        return { ...user, role: nextRole };
      })
    );
    const changed = users.find((item) => item.id === userId);
    if (changed) writeLog("Role өөрчилсөн", `${changed.name} -> ${roleLabel[nextRole]}`);
  };

  const handleStatusChange = (userId: number, nextStatus: UserStatus) => {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, status: nextStatus } : user)));
    const changed = users.find((item) => item.id === userId);
    if (changed) writeLog("Status өөрчилсөн", `${changed.name} -> ${statusLabel[nextStatus]}`);
  };

  const handleDelete = (userId: number) => {
    const target = users.find((user) => user.id === userId);
    if (!target || target.role === "admin") {
      setMessage("Админ хэрэглэгчийг устгах боломжгүй.");
      return;
    }
    setUsers((current) => current.filter((user) => user.id !== userId));
    writeLog("Хэрэглэгч устгасан", target.name);
    setMessage(`${target.name} хэрэглэгчийг жагсаалтаас устгалаа.`);
  };

  const handleCreateUser = () => {
    if (!createUserForm.name.trim() || !createUserForm.email.trim() || !createUserForm.department.trim()) {
      setMessage("Шинэ хэрэглэгч үүсгэхдээ бүх талбарыг бөглөнө үү.");
      return;
    }
    const nextUser: ManagedUser = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name: createUserForm.name.trim(),
      email: createUserForm.email.trim(),
      role: createUserForm.role,
      department: createUserForm.department.trim(),
      status: "active",
    };
    setUsers((current) => [...current, nextUser]);
    writeLog("Шинэ хэрэглэгч үүсгэсэн", `${nextUser.name} (${roleLabel[nextUser.role]})`);
    setCreateUserForm(defaultCreateUser);
    setMessage("Шинэ хэрэглэгч амжилттай үүслээ.");
  };

  const handleInlineEditSave = () => {
    const target = users.find((user) => user.id === editingUserId);
    if (target) {
      writeLog("Хэрэглэгчийн мэдээлэл зассан", target.name);
      setMessage(`${target.name} хэрэглэгчийн мэдээлэл шинэчлэгдлээ.`);
    }
    setEditingUserId(null);
  };

  const handleCreateErrorTask = () => {
    const target = users.find((user) => user.id === taskForm.targetUserId);
    if (!target || target.role === "admin") {
      setMessage("Алдаа заах хэрэглэгч буруу байна.");
      return;
    }
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.dueDate.trim()) {
      setMessage("Алдаа заахдаа гарчиг, тайлбар, хугацааг заавал бөглөнө.");
      return;
    }
    const task: ErrorTask = {
      id: `ERR-${String(errorTasks.length + 1).padStart(3, "0")}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      assignedTo: target.name,
      assignedRole: target.role,
      status: "new",
      dueDate: taskForm.dueDate,
      createdAt: nowString(),
    };
    const nextTasks = [task, ...errorTasks];
    setErrorTasks(nextTasks);
    localStorage.setItem(ADMIN_ERROR_TASKS_KEY, JSON.stringify(nextTasks));
    writeLog("Алдаа task болгон хадгалсан", `${task.id} -> ${target.name}`);
    setTaskForm({ ...defaultTaskForm, targetUserId: target.id });
    setMessage(`"${target.name}" хэрэглэгчийн алдаа task дээр амжилттай хадгалагдлаа.`);
  };

  const handlePolicyChange = (role: Exclude<RoleName, "admin">, value: string) => {
    setPolicies((current) => current.map((item) => (item.role === role ? { ...item, permissions: value } : item)));
  };

  const handlePolicySave = () => {
    writeLog("Role policy шинэчилсэн", "Director/Manager/Employee");
    setMessage("Role policy шинэчлэлтүүд хадгалагдлаа.");
  };

  const handleCreateOrUpdateInstruction = () => {
    if (!instructionForm.title.trim() || !instructionForm.content.trim()) {
      setMessage("Заавар үүсгэхдээ гарчиг болон агуулгыг бөглөнө үү.");
      return;
    }
    const existing = instructions.find(
      (item) => item.title.toLowerCase() === instructionForm.title.trim().toLowerCase() && item.targetRole === instructionForm.targetRole
    );

    if (!existing) {
      const next: SystemInstruction = {
        id: `INS-${Date.now()}`,
        title: instructionForm.title.trim(),
        targetRole: instructionForm.targetRole,
        content: instructionForm.content.trim(),
        version: 1,
        history: [{ version: 1, content: instructionForm.content.trim(), updatedAt: nowString() }],
      };
      setInstructions((current) => [next, ...current]);
      writeLog("Шинэ заавар нэмсэн", `${next.title} (${roleLabel[next.targetRole]})`);
      setMessage("Шинэ заавар амжилттай нэмэгдлээ.");
    } else {
      const nextVersion = existing.version + 1;
      setInstructions((current) =>
        current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                content: instructionForm.content.trim(),
                version: nextVersion,
                history: [
                  { version: nextVersion, content: instructionForm.content.trim(), updatedAt: nowString() },
                  ...item.history,
                ],
              }
            : item
        )
      );
      writeLog("Зааврын version шинэчилсэн", `${existing.title} v${nextVersion}`);
      setMessage("Зааврын шинэ хувилбар амжилттай хадгалагдлаа.");
    }
    setInstructionForm(defaultInstruction);
  };

  return (
    <AdminShell
      currentPath="/admin/users"
      kicker="Admin Governance"
      title="Системийн удирдлага, хяналт, бодлого"
      description="Админ бүх хэрэглэгч, role policy, заавар, audit лог болон алдааны task урсгалыг төвлөрсөн байдлаар хянаж удирдана."
      stats={[
        { label: "Нийт хэрэглэгч", value: String(users.length) },
        { label: "Идэвхгүй", value: String(roleStats.inactive) },
        { label: "Заавар", value: String(instructions.length) },
        { label: "Audit лог", value: String(activityLogs.length) },
      ]}
      noteText="Submit хийсэн task-г админ overwrite хийхгүй, алдаа бол task-ээр зааж хадгалдаг сахилга баттай урсгалыг мөрдөнө."
    >
      {message ? <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">{message}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Users</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хэрэглэгч удирдлага</h2>

          <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Нэр"
              value={createUserForm.name}
              onChange={(event) => setCreateUserForm((current) => ({ ...current, name: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Имэйл"
              value={createUserForm.email}
              onChange={(event) => setCreateUserForm((current) => ({ ...current, email: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Хэлтэс"
              value={createUserForm.department}
              onChange={(event) => setCreateUserForm((current) => ({ ...current, department: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <select
              value={createUserForm.role}
              onChange={(event) =>
                setCreateUserForm((current) => ({ ...current, role: event.target.value as Exclude<RoleName, "admin"> }))
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="director">Директор</option>
              <option value="manager">Менежер</option>
              <option value="employee">Ажилтан</option>
            </select>
            <button
              type="button"
              onClick={handleCreateUser}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-2"
            >
              Шинэ хэрэглэгч үүсгэх
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Нэр / Имэйл</th>
                    <th className="px-4 py-3 font-medium">Эрх</th>
                    <th className="px-4 py-3 font-medium">Төлөв</th>
                    <th className="px-4 py-3 font-medium">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-4">
                        {editingUserId === user.id ? (
                          <div className="space-y-2">
                            <input
                              value={user.name}
                              onChange={(event) =>
                                setUsers((current) =>
                                  current.map((item) => (item.id === user.id ? { ...item, name: event.target.value } : item))
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            />
                            <input
                              value={user.email}
                              onChange={(event) =>
                                setUsers((current) =>
                                  current.map((item) => (item.id === user.id ? { ...item, email: event.target.value } : item))
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 px-2 py-1"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="font-medium text-slate-950">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClasses[user.role]}`}>{roleLabel[user.role]}</span>
                          {user.role !== "admin" ? (
                            <select
                              value={user.role}
                              onChange={(event) => handleRoleChange(user.id, event.target.value as RoleName)}
                              className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                            >
                              <option value="director">Директор</option>
                              <option value="manager">Менежер</option>
                              <option value="employee">Ажилтан</option>
                            </select>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[user.status]}`}>
                            {statusLabel[user.status]}
                          </span>
                          <select
                            value={user.status}
                            onChange={(event) => handleStatusChange(user.id, event.target.value as UserStatus)}
                            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                          >
                            <option value="active">Идэвхтэй</option>
                            <option value="inactive">Идэвхгүй</option>
                            <option value="suspended">Түр түдгэлзсэн</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {editingUserId === user.id ? (
                            <button
                              type="button"
                              onClick={handleInlineEditSave}
                              className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white"
                            >
                              Хадгалах
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingUserId(user.id)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Засах
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.role === "admin"}
                            className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Устгах
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Role Policies</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Role эрхийн бодлого</h2>
          <div className="mt-5 space-y-3">
            {policies.map((policy) => (
              <div key={policy.role} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{roleLabel[policy.role]}</p>
                <textarea
                  value={policy.permissions}
                  onChange={(event) => handlePolicyChange(policy.role, event.target.value)}
                  className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handlePolicySave}
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Policy хадгалах
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Instructions</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Заавар, version удирдлага</h2>
          <div className="mt-5 space-y-3">
            <input
              value={instructionForm.title}
              onChange={(event) => setInstructionForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Зааврын гарчиг"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
            <select
              value={instructionForm.targetRole}
              onChange={(event) =>
                setInstructionForm((current) => ({ ...current, targetRole: event.target.value as Exclude<RoleName, "admin"> }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="director">Директор</option>
              <option value="manager">Менежер</option>
              <option value="employee">Ажилтан</option>
            </select>
            <textarea
              value={instructionForm.content}
              onChange={(event) => setInstructionForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="Зааврын дэлгэрэнгүй текст..."
              className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateOrUpdateInstruction}
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Заавар нэмэх / шинэчлэх
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {instructions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">v{item.version}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Role: {roleLabel[item.targetRole]}</p>
                <p className="mt-2 text-sm text-slate-700">{item.content}</p>
                {item.history[1] ? (
                  <p className="mt-2 text-xs text-slate-500">Өмнөх хувилбар: v{item.history[1].version}</p>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Task Enforcement</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Алдаа task болгон хадгалах</h2>
          <p className="mt-3 text-sm text-slate-600">Admin өөрөө засварлахгүй. Алдаа илэрвэл task болгож бүртгэнэ.</p>

          <div className="mt-5 space-y-4">
            <select
              value={taskForm.targetUserId}
              onChange={(event) => setTaskForm((current) => ({ ...current, targetUserId: Number(event.target.value) }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              {reviewableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({roleLabel[user.role]})
                </option>
              ))}
            </select>
            <input
              value={taskForm.title}
              onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Алдааны гарчиг"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
            <textarea
              value={taskForm.description}
              onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Алдааны тайлбар"
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateErrorTask}
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Алдааг task болгож хадгалах
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Гарчиг</th>
                    <th className="px-4 py-3 font-medium">Хэнд</th>
                    <th className="px-4 py-3 font-medium">Хугацаа</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {errorTasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-5 text-center text-slate-500">
                        Одоогоор алдааны task байхгүй байна.
                      </td>
                    </tr>
                  ) : (
                    errorTasks.slice(0, 6).map((task) => (
                      <tr key={task.id}>
                        <td className="px-4 py-4 font-medium text-slate-950">{task.id}</td>
                        <td className="px-4 py-4 text-slate-700">{task.title}</td>
                        <td className="px-4 py-4 text-slate-700">{task.assignedTo}</td>
                        <td className="px-4 py-4 text-slate-700">{task.dueDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Audit Trail</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Бүх үйлдлийн лог</h2>
        <p className="mt-2 text-sm text-slate-600">Хэн, юу, хэзээ хийснийг бүрэн хадгална. Өмнөх түүх устахгүй.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {activityLogs.slice(0, 12).map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{log.actor}</p>
              <p className="mt-1 text-sm text-slate-700">{log.action}</p>
              <p className="mt-1 text-xs text-slate-500">Target: {log.target}</p>
              <p className="mt-1 text-xs text-slate-500">{log.createdAt}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}