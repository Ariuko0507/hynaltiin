"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmployeeShell } from "../_components/employee-shell";

type TaskStatus = "Хүлээгдэж байна" | "Ажиллаж байна" | "Хоцорсон" | "Дууссан" | "Яаралтай";
type TaskFilter = "urgent" | "overdue" | "in_progress" | "all";

type TaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  due: string;
  assignedBy: string;
  assignedTo: string;
  location: string;
  deliverTo: string;
  description: string;
  urgencyRank: number;
};

const incomingTasks: TaskItem[] = [
  {
    id: "WA-101",
    title: "Сарын хяналтын тайлан бэлтгэх",
    status: "Ажиллаж байна",
    due: "2026-04-29 17:00",
    assignedBy: "Менежер Тэмүүжин",
    assignedTo: "Ажилтан Сарнай",
    location: "Дотоод систем / Тайлан хэсэг",
    deliverTo: "Директор Энх",
    description: "Сарын гүйцэтгэл, илэрсэн асуудал, дүгнэлтээ нэгтгэж тайлан бэлтгэнэ.",
    urgencyRank: 2,
  },
  {
    id: "WA-102",
    title: "Шалгалтын бүртгэлийн хүснэгт шинэчлэх",
    status: "Хүлээгдэж байна",
    due: "2026-04-30 12:00",
    assignedBy: "Ахлах ажилтан Саруул",
    assignedTo: "Ажилтан Сарнай",
    location: "Бичиг хэргийн өрөө",
    deliverTo: "Багийн ахлагч Номин",
    description: "Шалгалтад хамрагдсан байгууллагын мэдээллийг шинэ хүснэгтэд нэг мөрлөн оруулна.",
    urgencyRank: 3,
  },
  {
    id: "WA-103",
    title: "Салбарын гомдлын мөрөөр хариу хүргүүлэх",
    status: "Хоцорсон",
    due: "2026-04-25 18:00",
    assignedBy: "Менежер Тэмүүжин",
    assignedTo: "Ажилтан Сарнай",
    location: "1 давхар, үйлчилгээний цонх",
    deliverTo: "Иргэдтэй ажиллах нэгж",
    description: "Гомдлын мөрөөр авсан арга хэмжээ, хүргүүлсэн албан бичиг, хавсралтыг нэгтгэнэ.",
    urgencyRank: 1,
  },
    {
    id: "WA-105",
    title: "бббббббббббббббббббббб",
    status: "Яаралтай",
    due: "2026-04-25 18:00",
    assignedBy: "Менежер Тэмүүжин",
    assignedTo: "Ажилтан Сарнай",
    location: "1 давхар, үйлчилгээний цонх",
    deliverTo: "Иргэдтэй ажиллах нэгж",
    description: "Гомдлын мөрөөр авсан арга хэмжээ, хүргүүлсэн албан бичиг, хавсралтыг нэгтгэнэ.",
    urgencyRank: 1,
  },
  {
    id: "WA-104",
    title: "Багийн долоо хоногийн мэдээ нэгтгэх",
    status: "Дууссан",
    due: "2026-04-26 15:00",
    assignedBy: "Багийн ахлагч Номин",
    assignedTo: "Ажилтан Сарнай",
    location: "Google Drive / Team folder",
    deliverTo: "Менежер Тэмүүжин",
    description: "Багийн гишүүдийн долоо хоногийн мэдээллийг нэгтгэж байршуулна.",
    urgencyRank: 4,
  },
];

const filterLabels: Record<TaskFilter, string> = {
  all: "Бүгд",
  urgent: "Яаралтай",
  in_progress: "Хийгдэж байгаа",
  overdue: "Хоцорсон",
};

function getStatusClasses(status: TaskStatus) {
  if (status === "Дууссан") return "bg-emerald-100 text-emerald-700";
  if (status === "Ажиллаж байна") return "bg-sky-100 text-sky-700";
  if (status === "Хоцорсон") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function TaskDetailCard({ task }: { task: TaskItem }) {
  return (
    <div className="rounded-[28px] border border-stone-300 bg-white shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{task.id}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{task.title}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хэзээ дуусах</p>
          <p className="mt-2 font-medium text-slate-950">{task.due}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хэнээс ирсэн</p>
          <p className="mt-2 font-medium text-slate-950">{task.assignedBy}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хаана өгөх</p>
          <p className="mt-2 font-medium text-slate-950">{task.location}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хэнд өгөх</p>
          <p className="mt-2 font-medium text-slate-950">{task.deliverTo}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Юу хийх</p>
          <p className="mt-2 font-medium leading-7 text-slate-950">{task.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeTasksPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(incomingTasks[0].id);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("urgent");

  const filteredTasks = useMemo(() => {
    if (activeFilter === "overdue") {
      return incomingTasks
        .filter((task) => task.status === "Хоцорсон")
        .sort((a, b) => a.urgencyRank - b.urgencyRank);
    }

    if (activeFilter === "in_progress") {
      return incomingTasks
        .filter((task) => task.status === "Ажиллаж байна")
        .sort((a, b) => a.urgencyRank - b.urgencyRank);
    }

    if (activeFilter === "urgent") {
      return [...incomingTasks].sort((a, b) => a.urgencyRank - b.urgencyRank);
    }

    return incomingTasks;
  }, [activeFilter]);

  const selectedItem =
    filteredTasks.find((item) => item.id === selectedId) ??
    filteredTasks[0];

  const handleNavigateToFulfillment = () => {
    if (selectedItem) {
      router.push(`/employee/fulfillment?taskId=${selectedItem.id}&taskTitle=${encodeURIComponent(selectedItem.title)}`);
    }
  };

  return (
    <EmployeeShell
      currentPath="/employee/tasks"
      kicker="Tasks"
      title="Ажилтанд оноосон даалгаврууд"
      description="Танд ирсэн ажлуудыг шүүж햞аад, хэн өгсөн, хэзээ дуусгах, хаана хэнд өгөх мэдээллийг нэг дороос харна."
      stats={[
        { label: "Нийт ажил", value: "12" },
        { label: "Ид явж буй", value: "4" },
        { label: "Хоцорсон", value: "1" },
        { label: "Дууссан", value: "7" },
      ]}
      noteText="Шүүлтүүр ашиглаад яаралтай болон хоцорсон ажлаа түрүүлж хараарай."
    >
      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        {/* Left Sidebar - Task List */}
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Жагсаалт</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{filteredTasks.length} ажил</h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as TaskFilter[]).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => {
                  setActiveFilter(filterKey);
                  setSelectedId(
                    filteredTasks.length > 0 ? filteredTasks[0].id : incomingTasks[0].id
                  );
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
                    <p
                      className={`text-xs uppercase tracking-[0.24em] ${
                        selectedId === task.id ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {task.id}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold leading-snug">{task.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                      selectedId === task.id
                        ? "bg-white/15 text-white"
                        : getStatusClasses(task.status)
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                <div
                  className={`mt-3 space-y-1 text-xs ${
                    selectedId === task.id ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  <p>📌 {task.assignedBy}</p>
                  <p>⏰ {task.due}</p>
                </div>
              </button>
            ))}
          </div>
        </article>

        {/* Right Content - Task Details */}
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Дэлгэрэнгүй</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {selectedItem?.title || "Ажил сонгоно уу"}
              </h2>
            </div>
            {selectedItem && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  selectedItem.status
                )}`}
              >
                {selectedItem.status}
              </span>
            )}
          </div>

          <div className="mt-6">
            {selectedItem ? (
              <TaskDetailCard task={selectedItem} />
            ) : (
              <div className="rounded-2xl bg-slate-50 px-6 py-8 text-center text-slate-600">
                <p>Жагсаалтаас ажил сонгоно уу</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleNavigateToFulfillment}
              disabled={!selectedItem}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Биелэлтийн хуудасруу очих
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              Нэмэлт мэдээлэл нэмэх
            </button>
            <button
              type="button"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Дууссан гэж тэмдэглэх
            </button>
          </div>
        </article>
      </section>
    </EmployeeShell>
  );
}