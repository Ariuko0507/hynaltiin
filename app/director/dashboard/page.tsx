import Link from "next/link";

export default function DirectorDashboardPage() {
  const directorData = {
    name: "Директор Энх",
    email: "director@example.com",
    role: "Директор",
    division: "Үйл ажиллагааны захиргаа",
    lastReview: "2026-04-13",
    highlights: [
      "Төсвийн гүйцэтгэл 91% байна.",
      "Стратегийн зорилт 79%-тай биелэгдэж байна.",
      "Шинэ түншлэл 5 байгуулж амжилттай.",
    ],
    tasks: [
      "Компани зорилтуудыг хүлээн зөвшөөрөх.",
      "Гүйцэтгэлийн тайланг харах.",
      "Хуваарь, стратеги хурлыг товлох.",
    ],
  };

  const sidebarLinks = [
    { href: "/director/dashboard", label: "Самбар", icon: "📊" },
    { href: "/director/tasks", label: "Даалгавар", icon: "📋" },
    { href: "/director/fulfillment", label: "Биелүүлэлт", icon: "✅" },
    { href: "/director/meeting", label: "Хурал", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Директор Панел</h2>
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
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Директорыг самбар
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Компани стратеги, гүйцэтгэл, төслийн тойм
            </h1>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Директорыг мэдээлэл</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Нэр</p>
                    <p className="mt-2 text-lg font-medium">{directorData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">И‑мэйл</p>
                    <p className="mt-2 text-lg font-medium">{directorData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Роль</p>
                    <p className="mt-2 text-lg font-medium">{directorData.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Тасаг</p>
                    <p className="mt-2 text-lg font-medium">{directorData.division}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Товч тойм</h2>
                <div className="mt-5 space-y-3">
                  {directorData.highlights.map((item) => (
                    <div key={item} className="rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Үүрэг, даалгавар</h2>
                <div className="mt-5 space-y-3">
                  {directorData.tasks.map((task) => (
                    <div key={task} className="rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                      {task}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Түүнчлэн</h2>
                <ul className="mt-5 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>• Стратегийн хурал товлох</li>
                  <li>• Төсөв, гүйцэтгэлийн тайлан харах</li>
                  <li>• Гол түншлэл, өсөлтийн боломжийг дүгнэх</li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
