"use client";

import { useMemo, useState, useEffect } from "react";
import { DirectorShell } from "../_components/director-shell";
import { supabase, Task } from "@/lib/supabase";
import { getUnreadNotificationCount, createNotification } from "@/app/_lib/notifications";

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
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = 1; // TODO: Get from auth context

  // Manager-уудын жагсаалт
  const [managers, setManagers] = useState<{ id: string | number; name: string; department_id?: number }[]>([
    { id: "manager1", name: "Менежер Бат", department_id: 3 },
    { id: "manager2", name: "Менежер Тэмүүжин", department_id: 3 },
    { id: "manager3", name: "Менежер Саран", department_id: 4 },
    { id: "manager4", name: "Менежер Баяр", department_id: 4 },
    { id: "manager5", name: "Менежер Оюун", department_id: 4 },
  ]);

  // Database-ээс бүртгэлтэй менежерүүдийг авах
  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      console.log('Director Tasks - Менежерүүдийг авах оролдлого...');
      
      // Fetch all users (role column doesn't exist, filter manually if needed)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, department_id')
        .order('name');

      if (error) {
        console.error('Director Tasks - Менежерүүдийг авахад алдаа гарлаа:', error?.message || error);
        return;
      }
      
      console.log('Director Tasks - Амжилттай авсан менежерүүд:', data);
      setManagers(data || []);
    } catch (error) {
      console.error('Director Tasks - Менежерүүдийг авахад алдаа гарлаа:', error instanceof Error ? error.message : error);
    }
  };

  // Database-ээс tasks-ийг авах
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch notification count
  useEffect(() => {
    getUnreadNotificationCount(userId).then(setNotificationCount);
  }, [userId]);

  const fetchTasks = async () => {
    try {
      console.log('Director Tasks - Даалгавруудыг авах оролдлого...');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Director Tasks - Даалгавруудыг авахад алдаа гарлаа:', error);
        return;
      }
      
      console.log('Director Tasks - Амжилттай авсан даалгаврууд:', data);
      setTasks(data || []);
    } catch (error) {
      console.error('Director Tasks - Даалгавруудыг авахад алдаа гарлаа:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!taskData.title.trim()) {
      alert('Даалгаврын гарчиг оруулна уу!');
      return;
    }

    try {
      console.log('Director Tasks - Даалгавар хадгалах оролдлого...', taskData);
      console.log('Supabase URL:', (process.env as any).NEXT_PUBLIC_SUPABASE_URL);
      
      const insertData = {
        task_id: `task_${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        assigned_to: taskData.assignedTo,
        due_date: taskData.dueDate,
        status: 'Эхэлсэн',
        created_by: 1 // Director ID
      };
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(insertData);

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Director Tasks - Даалгавар хадгалахад алдаа гарлаа:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert('Даалгавар хадгалахад алдаа гарлаа: ' + JSON.stringify(error));
        return;
      }
      
      console.log('Director Tasks - Даалгавар амжилттай хадгалагдлаа:', data);
      
      // Send notification to the assigned manager
      if (taskData.assignedTo) {
        const assignedManager = managers.find(m => m.name === taskData.assignedTo);
        if (assignedManager) {
          await createNotification(
            Number(assignedManager.id),
            'Шинэ даалгавар',
            `Директор танд шинэ даалгавар өглөө: ${taskData.title}`,
            'task',
            '/director/tasks'
          );
        }
      }
      
      alert('Даалгавар амжилттай үүсгэгдлээ!');
      
      setTaskData({ title: '', description: '', assignedTo: '', dueDate: '' });
      setShowTaskForm(false);
      fetchTasks();
      
    } catch (error) {
      console.error('Director Tasks - Даалгавар үүсгэхэд алдаа гарлаа:', error);
      console.error('Catch error details:', JSON.stringify(error, null, 2));
      alert('Даалгавар үүсгэхэд алдаа гарлаа!');
    }
  };

  const filteredTasks = useMemo(() => {
    // Database-ээс авсан tasks-ийг display хийх
    const displayTasks = tasks.map((task: Task) => ({
      id: task.task_id,
      title: task.title,
      status: (task.status === 'Эхэлсэн' ? 'Эхэлсэн' : 
              task.status === 'Зассан' ? 'Зассан' : 
              task.status === 'Эсхийг' ? 'Эсхийг' : 'Дууссан') as TaskStatus,
      due: task.due_date || 'Тодорхойгүй',
      owner: 'Директор Энх',
      assignedBy: String(task.assigned_to) || 'Тодорхойгүй',
      description: task.description || 'Тайлбар байхгүй'
    }));

    if (activeFilter === "in_progress") {
      return displayTasks.filter((task) => task.status === "Эхэлсэн" || task.status === "Зассан");
    }
    if (activeFilter === "pending") {
      return displayTasks.filter((task) => task.status === "Эсхийг");
    }
    if (activeFilter === "completed") {
      return displayTasks.filter((task) => task.status === "Дууссан");
    }
    return displayTasks;
  }, [activeFilter, tasks]);

  const selectedItem = filteredTasks.find((item) => item.id === selectedId) ?? filteredTasks[0];

  return (
    <DirectorShell
      currentPath="/director/tasks"
      kicker="Tasks"
      title="Директорын даалгаврууд"
      description="Стратегийн чухал даалгавруудыг хянаж, статусыг шинэчилж, багийн ажилтнуудад удирдамж өгнө."
      stats={[
        { label: "Нийт даалгавар", value: String(tasks.length) },
        { label: "Идэвхтэй", value: String(tasks.filter(t => t.status === 'Эхэлсэн' || t.status === 'Зассан').length) },
        { label: "Хүлээгдэж буй", value: String(tasks.filter(t => t.status === 'Эсхийг').length) },
      ]}
      notifications={notificationCount}
      userId={userId}
      noteText="Шүүлтүүр ашиглаад идэвхтэй болон хүлээгдэж буй даалгавруудаа түрүүлж хараарай."
    >
      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Жагсаалт</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{filteredTasks.length} даалгавар</h2>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Шинэ даалгавар
            </button>
          </div>

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

      {/* Шинэ даалгавар үүсгэх modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[30px] border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Шинэ бүртгэл</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Даалгавар үүсгэх</h2>
                </div>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Даалгаврын гарчиг</label>
                  <input
                    type="text"
                    value={taskData.title}
                    onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Даалгаврын гарчиг оруулна уу"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Тайлбар</label>
                  <textarea
                    value={taskData.description}
                    onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Даалгаврын талаар дэлгэрэнгүй тайлбар"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Олгох менежер</label>
                    <select
                      value={taskData.assignedTo}
                      onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Менежер сонгох</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.name}>
                          {manager.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Дуусах хугацаа</label>
                    <input
                      type="date"
                      value={taskData.dueDate}
                      onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateTask}
                    className="flex-1 rounded-xl bg-emerald-600 text-white px-6 py-3 font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Даалгавар үүсгэх
                  </button>
                  <button
                    onClick={() => {
                      setTaskData({ title: '', description: '', assignedTo: '', dueDate: '' });
                      setShowTaskForm(false);
                    }}
                    className="flex-1 rounded-xl bg-red-600 text-white px-6 py-3 font-medium hover:bg-red-700 transition-colors"
                  >
                    Цуцлах
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DirectorShell>
  );
}
