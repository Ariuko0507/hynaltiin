import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminInfo = {
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  permissions: string[];
  alerts: string[];
};

async function getAdminInfo(): Promise<AdminInfo> {
  if (!supabase) {
    console.warn("Supabase not configured, using fallback data");
    return {
      name: "Админ Бат",
      email: "admin@example.com",
      role: "Системийн админ",
      department: "IT удирдлага",
      lastLogin: new Date().toLocaleString("mn-MN"),
      permissions: [
        "Хэрэглэгчийн эрх удирдах",
        "Системийн тохиргоог өөрчлөх",
        "Аудит ба тайлан үүсгэх",
        "Өгөгдлийг нөөцлөх болон сэргээх",
      ],
      alerts: [
        "Supabase тохиргоог хийнэ үү",
        "Системийн шинэчлэлт иргэддээ зарлах.",
      ],
    };
  }

  // Get admin user (assuming first admin user)
  const { data: adminUser, error: userError } = await supabase
    .from("users")
    .select("name, email, role_id, department_id, updated_at")
    .eq("role_id", 1) // admin role
    .limit(1)
    .single();

  if (userError || !adminUser) {
    console.error("Error fetching admin user:", userError?.message);
    return {
      name: "Админ",
      email: "admin@example.com",
      role: "Системийн админ",
      department: "IT удирдлага",
      lastLogin: "Тодорхойгүй",
      permissions: ["Хэрэглэгчийн эрх удирдах", "Системийн тохиргоог өөрчлөх"],
      alerts: ["Системийн шинэчлэлт шаардлагатай"],
    };
  }

  // Get department name
  const { data: department } = adminUser.department_id
    ? await supabase.from("departments").select("name").eq("id", adminUser.department_id).single()
    : { data: null };

  // Get role name
  const { data: role } = await supabase.from("roles").select("name").eq("id", adminUser.role_id).single();

  return {
    name: adminUser.name,
    email: adminUser.email,
    role: role?.name === "admin" ? "Системийн админ" : role?.name || "Админ",
    department: department?.name || "IT удирдлага",
    lastLogin: adminUser.updated_at ? new Date(adminUser.updated_at).toLocaleString("mn-MN") : "Тодорхойгүй",
    permissions: [
      "Хэрэглэгчийн эрх удирдах",
      "Системийн тохиргоог өөрчлөх",
      "Аудит ба тайлан үүсгэх",
      "Өгөгдлийг нөөцлөх болон сэргээх",
    ],
    alerts: [
      "Нууц үг шинэчлэх .",
      
    ],
  };
}

export default async function AdminDashboardPage() {
  const adminInfo = await getAdminInfo();

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
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Админ хяналтын самбар
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Системийн эрх, байршил, мэдэгдлүүд
            </h1>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Админын мэдээлэл</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Нэр</p>
                    <p className="mt-2 text-lg font-medium">{adminInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">И‑мэйл</p>
                    <p className="mt-2 text-lg font-medium">{adminInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Роль</p>
                    <p className="mt-2 text-lg font-medium">{adminInfo.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Тасаг</p>
                    <p className="mt-2 text-lg font-medium">{adminInfo.department}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Сүүлд нэвтэрсэн</p>
                    <p className="mt-2 text-lg font-medium">{adminInfo.lastLogin}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Үйлдлийн эрх</h2>
                <div className="mt-5 grid gap-3">
                  {adminInfo.permissions.map((permission) => (
                    <div key={permission} className="rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Мэдэгдэл</h2>
                <div className="mt-5 space-y-3">
                  {adminInfo.alerts.map((alert) => (
                    <div key={alert} className="rounded-3xl bg-white p-4 text-sm text-zinc-800 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                      {alert}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-semibold">Дэмжлэг болон найман холбоос</h2>
                <ul className="mt-5 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>• Нууц үг солих</li>
                  <li>• Системийн лог харах</li>
                  <li>• Үйлдлийн аудит татах</li>
                  <li>• Хэрэглэгчийн мэдээлэл засварлах</li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
