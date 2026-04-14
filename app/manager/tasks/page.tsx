import Link from "next/link";

const managerTasks = [
  {
    id: "M-301",
    title: "Багийн хуваарь шинэчлэх",
    status: "Эхэлсэн",
    due: "2026-04-19",
    owner: "Менежер Тэмүүжин",
  },
  {
    id: "M-302",
    title: "Төсөл бүрийн тайлан боловсруулах",
    status: "Зассан",
    due: "2026-04-22",
    owner: "Менежер Тэмүүжин",
  },
  {
    id: "M-303",
    title: "Ресурс хуваарилалт хянах",
    status: "Эсхийг",
    due: "2026-04-20",
    owner: "Менежер Тэмүүжин",
  },
  {
    id: "M-304",
    title: "Ажилтнуудын гүйцэтгэлийг үнэлэх",
    status: "Эхэлсэн",
    due: "2026-04-25",
    owner: "Менежер Тэмүүжин",
  },
];

export default function ManagerTasksPage() {
  const sidebarLinks = [
    { href: "/manager/dashboard", label: "Самбар", icon: "📊" },
    { href: "/manager/tasks", label: "Даалгавар", icon: "📋" },
    { href: "/manager/fulfillment", label: "Биелүүлэлт", icon: "✅" },
    { href: "/manager/meeting", label: "Хурал", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Менежер Панел</h2>
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
              Менежерийн даалгавар
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Багийн даалгаврыг засварлах
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Даалгаврын статусыг засварлах эрхтэй.
            </p>
          </header>

          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Гарчиг</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Хугацаа</th>
                  <th className="px-6 py-4">Хариуцагч</th>
                  <th className="px-6 py-4">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {managerTasks.map((task) => (
                  <tr key={task.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 font-medium text-zinc-950 dark:text-zinc-50">{task.id}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{task.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          task.status === "Эхэлсэн"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                            : task.status === "Зассан"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{task.due}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{task.owner}</td>
                    <td className="px-6 py-4">
                      <button
                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        Засварлах
                      </button>
                    </td>
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
