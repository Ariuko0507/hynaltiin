"use client";

import { useMemo, useState } from "react";
import { DirectorShell } from "../_components/director-shell";

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

const directorTasks: TaskItem[] = [
  {
    id: "D-201",
    title: "Стратегийн төлөвлөгөөг хүлээн зөвшөөрөх",
    status: "Эхэлсэн",
    due: "2026-04-21",
    owner: "Директор Энх",
    assignedBy: "Гүйцэтгэх захирал",
    description: "Компанийн стратегийн төлөвлөгөөг хүлээн зөвшөөрч, албан ёсны баталгаа олгох.",
  },
  {
    id: "D-202",
    title: "Төслийн гүйцэтгэлийн тайланг батлах",
    status: "Зассан",
    due: "2026-04-18",
    owner: "Директор Энх",
    assignedBy: "Менежер Тэмүүжин",
    description: "Сарын төслийн гүйцэтгэлийн тайланг хянаж, батлах эсэхийг шийдвэрлэх.",
  },
  {
    id: "D-203",
    title: "Стратегийн хурал товлох",
    status: "Эсхийг",
    due: "2026-04-20",
    owner: "Директор Энх",
    assignedBy: "Багийн ахлагч Номин",
    description: "Удирдах зөвлөлийн стратегийн хурлыг товлож, бэлтгэл хангах.",
  },
  {
    id: "D-204",
    title: "Түншлэлийн саналын судалгаа хийх",
    status: "Дууссан",
    due: "2026-04-19",
    owner: "Директор Энх",
    assignedBy: "Хөгжлийн алба",
    description: "Шинэ түншлэлийн боломжуудын эрх зүйн болон эдийн засгийн үр өгөөжийг дүгнэх.",
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

export default function DirectorTasksPage() {
  const [selectedId, setSelectedId] = useState(directorTasks[0].id);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

  const filteredTasks = useMemo(() => {
    if (activeFilter === "in_progress") {
      return directorTasks.filter((task) => task.status === "Эхэлсэн" || task.status === "Зассан");
    }
    if (activeFilter === "pending") {
      return directorTasks.filter((task) => task.status === "Эсхийг");
    }
    if (activeFilter === "completed") {
      return directorTasks.filter((task) => task.status === "Дууссан");
    }
    return directorTasks;
  }, [activeFilter]);

  const selectedItem = filteredTasks.find((item) => item.id === selectedId) ?? filteredTasks[0];

  return (
    <DirectorShell
      currentPath="/director/tasks"
      kicker="Tasks"
      title="Директорын даалгаврууд"
      description="Стратегийн чухал даалгавруудыг хянаж, статусыг шинэчилж, багийн ажилтнуудад удирдамж өгнө."
      stats={[
        { label: "Нийт даалгавар", value: "4" },
        { label: "Идэвхтэй", value: "2" },
        { label: "Хүлээгдэж буй", value: "1" },
        { label: "Дууссан", value: "1" },
      ]}
      noteText="Шүүлтүүр ашиглаад идэвхтэй болон хүлээгдэж буй даалгавруудаа түрүүлж хараарай."
    >
      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
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
                  setSelectedId(filteredTasks.length > 0 ? filteredTasks[0].id : directorTasks[0].id);
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
    </DirectorShell>
  );
}
