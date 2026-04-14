import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MeetingRow = {
  id: string;
  title: string;
  status: string;
  organizer: string;
  date: string;
};

const statusStyles: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  ongoing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  default: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200",
};

const statusLabels: Record<string, string> = {
  scheduled: "Төлөвлөгдсөн",
  ongoing: "Явж байна",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
};

async function getMeetingItems(): Promise<MeetingRow[]> {
  if (!supabase) {
    console.warn("Supabase not configured, using sample data");
    return [
      {
        id: "MT-001",
        title: "Сургалтын төслийн уулзалт",
        status: "scheduled",
        organizer: "Директор Энх",
        date: "2026-04-20",
      },
      {
        id: "MT-002",
        title: "Сургалтын хяналтын хурал",
        status: "completed",
        organizer: "Админ Бат",
        date: "2026-05-03",
      },
    ];
  }

  const { data: meetings, error: meetingError } = await supabase
    .from("meetings")
    .select("meeting_code, title, status, meeting_date, organizer_id")
    .order("meeting_date", { ascending: false });

  if (meetingError) {
    console.error("Supabase meetings error:", meetingError.message);
    return [];
  }

  const organizerIds = Array.from(
    new Set(
      meetings
        ?.map((item) => item.organizer_id)
        .filter((id): id is number => typeof id === "number") || []
    )
  );

  const { data: users } = organizerIds.length
    ? await supabase.from("users").select("id, name").in("id", organizerIds)
    : { data: [] };

  return (meetings || []).map((item) => ({
    id: item.meeting_code || "",
    title: item.title || "",
    status: item.status || "scheduled",
    organizer:
      users?.find((user) => user.id === item.organizer_id)?.name || "Тодорхойгүй",
    date: item.meeting_date ? String(item.meeting_date).slice(0, 10) : "",
  }));
}

export default async function AdminMeetingPage() {
  const meetingItems = await getMeetingItems();
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
              Админий хурал
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Бүх хурлын хяналт
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Эхэлсэн, зассан, эсхийг бүх статусыг харах боломжтой.
            </p>
          </header>

          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Гарчиг</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Зохион байгуулагч</th>
                  <th className="px-6 py-4">Огноо</th>
                </tr>
              </thead>
              <tbody>
                {meetingItems.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 font-medium text-zinc-950 dark:text-zinc-50">{item.id}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status] ?? statusStyles.default
                        }`}
                      >
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.organizer}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.date}</td>
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
