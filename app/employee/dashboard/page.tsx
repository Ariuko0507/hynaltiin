import Link from "next/link";

export default function EmployeeDashboardPage() {
  const employeeData = {
    name: "Ажилтан Сарнай",
    email: "employee@example.com",
    role: "Ажилтан",
    department: "Үйл ажиллагаа",
    focus: "Өдөр тутмын үүрэг, даалгавар, гүйцэтгэл",
    stats: [
      "Гүйцэтгэсэн даалгавар: 17",
      "Хийх ёстой: 4",
      "Эргэн хэрэгтэй: 1",
    ],
    tasks: [
      "Өдөр тутмын даалгавар харах",
      "Гүйцэтгэлийн тайлан шинэчлэх",
      "Багийн мэдэгдэл авах",
    ],
  };

  const sidebarLinks = [
    { href: "/employee/dashboard", label: "Самбар", icon: "📊" },
    { href: "/employee/tasks", label: "Даалгавар", icon: "📋" },
    { href: "/employee/fulfillment", label: "Биелүүлэлт", icon: "✅" },
    { href: "/employee/meeting", label: "Хурал", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Ажилтан Панел</h2>
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
              Ажилтны самбар
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Өдөр тутмын үүрэг, даалгавар, гүйцэтгэлийн хяналт
            </h1>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Ажилтны мэдээлэл</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Нэр</p>
                    <p className="mt-2 text-lg font-medium">{employeeData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">И‑мэйл</p>
                    <p className="mt-2 text-lg font-medium">{employeeData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Роль</p>
                    <p className="mt-2 text-lg font-medium">{employeeData.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Тасаг</p>
                    <p className="mt-2 text-lg font-medium">{employeeData.department}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Гүйцэтгэлийн статистик</h2>
                <div className="mt-5 space-y-3">
                  {employeeData.stats.map((stat) => (
                    <div key={stat} className="rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                      {stat}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Үүрэг, даалгавар</h2>
                <div className="mt-5 space-y-3">
                  {employeeData.tasks.map((task) => (
                    <div key={task} className="rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                      {task}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Товч мэдээлэл</h2>
                <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  Өдөр тутмын ажлын жагсаалт, гүйцэтгэлийн тайланг шинэчлэх боломжтой.
                </p>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Хуудас руу очих</h2>
                <div className="mt-5 space-y-3">
                  <Link
                    href="/employee/tasks"
                    className="block rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Даалгавруудыг харах
                  </Link>
                  <Link
                    href="/employee/fulfillment"
                    className="block rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Гүйцэтгэлийг илгээх
                  </Link>
                  <Link
                    href="/employee/meeting"
                    className="block rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Хурал үүсгэх
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
