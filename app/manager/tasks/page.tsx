"use client";

import { useMemo, useState } from "react";
import { ManagerShell } from "../_components/manager-shell";

type TaskStatus = "Эхэлсэн" | "Зассан" | "Эсхийг" | "Дууссан";
type TaskFilter = "all" | "in_progress" | "pending" | "completed";

type TaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  due: string;
  owner: string;
  assignedBy: string;
  description: string;
};

type Employee = {
  id: string;
  name: string;
  role: string;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  totalTasks: number;
  completionRate: number;
  avatar: string;
};

const employees: Employee[] = [
  {
    id: "E-001",
    name: "Бат",
    role: "Ажилтан",
    tasksCompleted: 12,
    tasksInProgress: 3,
    tasksPending: 1,
    totalTasks: 16,
    completionRate: 75,
    avatar: "БТ",
  },
  {
    id: "E-002",
    name: "Сарнай",
    role: "Ажилтан",
    tasksCompleted: 15,
    tasksInProgress: 2,
    tasksPending: 0,
    totalTasks: 17,
    completionRate: 88,
    avatar: "СН",
  },
  {
    id: "E-003",
    name: "Дорж",
    role: "Ажилтан",
    tasksCompleted: 10,
    tasksInProgress: 4,
    tasksPending: 2,
    totalTasks: 16,
    completionRate: 63,
    avatar: "ДЖ",
  },
  {
    id: "E-004",
    name: "Номин",
    role: "Ажилтан",
    tasksCompleted: 14,
    tasksInProgress: 3,
    tasksPending: 1,
    totalTasks: 18,
    completionRate: 78,
    avatar: "НМ",
  },
  {
    id: "E-005",
    name: "Тэмүүжин",
    role: "Менежер",
    tasksCompleted: 8,
    tasksInProgress: 5,
    tasksPending: 2,
    totalTasks: 15,
    completionRate: 53,
    avatar: "ТЖ",
  },
];

const managerTasks: TaskItem[] = [
  {
    id: "M-301",
    title: "Багийн хуваарь шинэчлэх",
    status: "Эхэлсэн",
    due: "2026-04-19",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Директор Энх",
    description: "Багийн ажилтнуудын хуваарийг шинэчилж, оновчтой болгох.",
  },
  {
    id: "M-302",
    title: "Төсөл бүрийн тайлан боловсруулах",
    status: "Зассан",
    due: "2026-04-22",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Директор Энх",
    description: "Бүх төслийн тайланг нэгтгэн, дүгнэлт гаргах.",
  },
  {
    id: "M-303",
    title: "Ресурс хуваарилалт хянах",
    status: "Эсхийг",
    due: "2026-04-20",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Санхүүгийн алба",
    description: "Багийн нөөцийн хуваарилалтыг хянаж, зохицуулах.",
  },
  {
    id: "M-304",
    title: "Ажилтнуудын гүйцэтгэлийг үнэлэх",
    status: "Дууссан",
    due: "2026-04-25",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Хүний нөөц",
    description: "Багийн гишүүдийн сарын гүйцэтгэлийг үнэлж, тайлан гаргах.",
  },
];

const filterLabels: Record<TaskFilter, string> = {
  all: "Бүгд",
  in_progress: "Хийгдэж буй",
  pending: "Хүлээгдэж буй",
  completed: "Дууссан",
};

function getStatusClasses(status: TaskStatus) {
  if (status === "Дууссан") return "bg-emerald-100 text-emerald-700";
  if (status === "Зассан") return "bg-sky-100 text-sky-700";
  if (status === "Эсхийг") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

function TaskDetailCard({ task }: { task: TaskItem }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{task.id}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{task.title}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(task.status)}`}>
          {task.status}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хугацаа</p>
          <p className="mt-2 font-medium text-slate-950">{task.due}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хариуцагч</p>
          <p className="mt-2 font-medium text-slate-950">{task.owner}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Даалгасан</p>
          <p className="mt-2 font-medium text-slate-950">{task.assignedBy}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Тайлбар</p>
          <p className="mt-2 font-medium leading-7 text-slate-950">{task.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function ManagerTasksPage() {
  const [selectedId, setSelectedId] = useState(managerTasks[0].id);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

  const filteredTasks = useMemo(() => {
    if (activeFilter === "in_progress") {
      return managerTasks.filter((task) => task.status === "Эхэлсэн" || task.status === "Зассан");
    }
    if (activeFilter === "pending") {
      return managerTasks.filter((task) => task.status === "Эсхийг");
    }
    if (activeFilter === "completed") {
      return managerTasks.filter((task) => task.status === "Дууссан");
    }
    return managerTasks;
  }, [activeFilter]);

  const selectedItem = filteredTasks.find((item) => item.id === selectedId) ?? filteredTasks[0];

  return (
    <ManagerShell
      currentPath="/manager/tasks"
      kicker="Tasks"
      title="Менежерийн даалгаврууд"
      description="Багийн даалгавруудыг хянаж, статусыг шинэчилж, ажилтнуудад удирдамж өгнө."
      stats={[
        { label: "Нийт даалгавар", value: "4" },
        { label: "Идэвхтэй", value: "2" },
        { label: "Хүлээгдэж буй", value: "1" },
      ]}
      noteText="Шүүлтүүр ашиглаад идэвхтэй болон хүлээгдэж буй даалгавруудаа түрүүлж хараарай."
      notifications={2}
    >
      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Багийн гүйцэтгэл</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хамгийн идэвхтэй ажилтан</h2>
              </div>
              <span className="text-2xl">🏆</span>
            </div>

            <div className="space-y-3">
              {employees
                .sort((a, b) => b.completionRate - a.completionRate)
                .slice(0, 3)
                .map((emp, index) => (
                <div key={emp.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-slate-200 text-slate-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                    {emp.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-950">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.tasksCompleted} даалгавар биелүүлсэн</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-950">{emp.completionRate}%</p>
                    <p className="text-xs text-slate-400">биелэлт</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Багийн нийт статистик</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-700">
                    {employees.reduce((acc, e) => acc + e.tasksCompleted, 0)}
                  </p>
                  <p className="text-xs text-emerald-600">Дууссан</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-center">
                  <p className="text-xl font-bold text-blue-700">
                    {employees.reduce((acc, e) => acc + e.tasksInProgress, 0)}
                  </p>
                  <p className="text-xs text-blue-600">Хийж буй</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-center">
                  <p className="text-xl font-bold text-amber-700">
                    {employees.reduce((acc, e) => acc + e.tasksPending, 0)}
                  </p>
                  <p className="text-xs text-amber-600">Хүлээгдэж буй</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Жагсаалт</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{filteredTasks.length} даалгавар</h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as TaskFilter[]).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => {
                  setActiveFilter(filterKey);
                  setSelectedId(filteredTasks.length > 0 ? filteredTasks[0].id : managerTasks[0].id);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  activeFilter === filterKey
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {filterLabels[filterKey]}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedId(task.id)}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  selectedId === task.id
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-950 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className={`text-xs uppercase tracking-[0.24em] ${selectedId === task.id ? "text-slate-300" : "text-slate-400"}`}>
                      {task.id}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold leading-snug">{task.title}</h3>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                    selectedId === task.id ? "bg-white/15 text-white" : getStatusClasses(task.status)
                  }`}>
                    {task.status}
                  </span>
                </div>

                <div className={`mt-3 space-y-1 text-xs ${selectedId === task.id ? "text-slate-200" : "text-slate-600"}`}>
                  <p>📌 {task.assignedBy}</p>
                  <p>⏰ {task.due}</p>
                </div>
              </button>
            ))}
          </div>
        </article>
        </div>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Дэлгэрэнгүй</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedItem?.title || "Сонгоно уу"}</h2>
            </div>
            {selectedItem && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(selectedItem.status)}`}>
                {selectedItem.status}
              </span>
            )}
          </div>

          <div className="mt-6">
            {selectedItem ? (
              <TaskDetailCard task={selectedItem} />
            ) : (
              <div className="rounded-2xl bg-slate-50 px-6 py-8 text-center text-slate-600">
                <p>Жагсаалтаас даалгавар сонгоно уу</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!selectedItem}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Биелэлт харах
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              Тэмдэглэл нэмэх
            </button>
            <button
              type="button"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Батлах
            </button>
          </div>
        </article>
      </section>
    </ManagerShell>
  );
}
