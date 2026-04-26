import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "../_components/admin-shell";

type MeetingRow = {
  id: string;
  title: string;
  status: string;
  organizer: string;
  date: string;
};

const statusStyles: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-700",
  ongoing: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  default: "bg-slate-100 text-slate-700",
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

  return (
    <AdminShell
      currentPath="/admin/meeting"
      kicker="Meetings"
      title="Бүх хурлын хяналт"
      description="Хурлын төлөв, зохион байгуулагч болон огноог ажилтны хуудасны загвартай ижилхэн байдлаар хянах хэсэг."
      stats={[
        { label: "Нийт хурал", value: String(meetingItems.length) },
        { label: "Төлөвлөгдсөн", value: String(meetingItems.filter((item) => item.status === "scheduled").length) },
        { label: "Явж байна", value: String(meetingItems.filter((item) => item.status === "ongoing").length) },
        { label: "Дууссан", value: String(meetingItems.filter((item) => item.status === "completed").length) },
      ]}
      action={
        <Link
          href="/admin/dashboard"
          className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Самбар луу буцах
        </Link>
      }
      noteText="Төлөвлөгдсөн болон цуцлагдсан хурлуудын мэдээллийг оролцогчдод цаг тухайд нь шинэчилж байгаарай."
    >
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Хуваарь</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хурлын жагсаалт</h2>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Гарчиг</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Зохион байгуулагч</th>
                  <th className="px-4 py-3 font-medium">Огноо</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {meetingItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 font-medium text-slate-950">{item.id}</td>
                    <td className="px-4 py-4 text-slate-700">{item.title}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status] ?? statusStyles.default
                        }`}
                      >
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{item.organizer}</td>
                    <td className="px-4 py-4 text-slate-700">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}