import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  due: string;
  owner: string;
};

async function getTasks(): Promise<TaskRow[]> {
  if (!supabase) {
    console.warn("Supabase not configured, using sample data");
    return [
      {
        id: "T-1001",
        title: "Сургалтын материалыг шинэчлэх",
        status: "in_progress",
        due: "2026-05-01",
        owner: "Менежер Тэмүүжин",
      },
      {
        id: "T-1002",
        title: "Харилцааны хичээлийн тайлан боловсруулах",
        status: "new",
        due: "2026-05-15",
        owner: "Ажилтан Сарнай",
      },
    ];
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("task_code, title, status, due_date, assigned_to")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Supabase tasks error:", error.message);
    return [];
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

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  const statusLabels: Record<string, string> = {
    new: "Эхэлсэн",
    in_progress: "Явж байна",
    completed: "Зассан",
    cancelled: "Цуцлагдсан",
  };

  const statusStyles: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    in_progress: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  };

  const sidebarLinks = [
    { href: "/admin/dashboard", label: "Самбар", icon: "📊" },
    { href: "/admin/tasks", label: "Даалгавар", icon: "📋" },
    { href: "/admin/fulfillment", label: "Биелүүлэлт", icon: "✅" },
    { href: "/admin/meeting", label: "Хурал", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Админ Панел</h2>
        </div>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span>🏠</span>
            Нүүр хуудас
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Админ даалгавар
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Системийн хяналтын даалгаврууд
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Үүрэг бүрийн статус, хугацаа болон хариуцагчийг эндээс хянах боломжтой.
            </p>
          </header>

          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <th className="px-6 py-4">Даалгавар ID</th>
                  <th className="px-6 py-4">Гарчиг</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Хугацаа</th>
                  <th className="px-6 py-4">Хариуцагч</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 font-medium text-zinc-950 dark:text-zinc-50">{task.id}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{task.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[task.status] ?? statusStyles.new
                        }`}
                      >
                        {statusLabels[task.status] ?? task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{task.due}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{task.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
