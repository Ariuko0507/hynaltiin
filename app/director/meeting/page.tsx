"use client";

import { useState } from "react";
import { DirectorShell } from "../_components/director-shell";

type MeetingStatus = "Төлөвлөсөн" | "Баталгаажсан" | "Цуцлагдсан";

type MeetingItem = {
  id: string;
  title: string;
  status: MeetingStatus;
  organizer: string;
  date: string;
  location: string;
};

function getStatusClasses(status: MeetingStatus) {
  if (status === "Баталгаажсан") return "bg-emerald-100 text-emerald-700";
  if (status === "Төлөвлөсөн") return "bg-sky-100 text-sky-700";
  return "bg-rose-100 text-rose-700";
}

// ── Meeting Page ──────────────────────────────────────────────────────────────

const initialMeetingItems: MeetingItem[] = [
  {
    id: "M-001",
    title: "Сарын тайлангийн хурал",
    status: "Баталгаажсан",
    organizer: "Админ Бат",
    date: "2026-04-29 10:00",
    location: "2 давхар, хурлын өрөө A",
  },
  {
    id: "M-002",
    title: "Төслийн явцын уулзалт",
    status: "Төлөвлөсөн",
    organizer: "Менежер Тэмүүжин",
    date: "2026-04-30 14:00",
    location: "Google Meet",
  },
  {
    id: "M-003",
    title: "Стратегийн төлөвлөгөөний хурал",
    status: "Цуцлагдсан",
    organizer: "Директор Энх",
    date: "2026-05-01 09:00",
    location: "Төв байр, хурлын танхим",
  },
];

export default function DirectorMeetingPage() {
  const [items, setItems] = useState(initialMeetingItems);
  const [showForm, setShowForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    status: "Төлөвлөсөн" as MeetingStatus,
    date: "",
    location: "",
  });

  const handleSend = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.location) {
      return;
    }

    const newItem: MeetingItem = {
      id: `M-${String(items.length + 1).padStart(3, "0")}`,
      title: newMeeting.title,
      status: newMeeting.status,
      organizer: "Директор Энх",
      date: newMeeting.date,
      location: newMeeting.location,
    };

    setItems((current) => [...current, newItem]);
    setNewMeeting({ title: "", status: "Төлөвлөсөн", date: "", location: "" });
    setShowForm(false);
  };

  return (
    <DirectorShell
      currentPath="/director/meeting"
      kicker="Meetings"
      title="Хурал, уулзалтын хуваарь"
      description="Өөрийн оролцох хурал, зохион байгуулагч, хугацаа болон байршлыг нэг ижил загвартайгаар харж, шаардлагатай үед шинэ уулзалт үүсгэнэ."
      stats={[
        { label: "Энэ 7 хоног", value: "5" },
        { label: "Баталгаажсан", value: "3" },
        { label: "Төлөвлөсөн", value: "1" },
        { label: "Цуцлагдсан", value: "0" },
      ]}
      notifications={2}
      action={
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Хурал үүсгэх
        </button>
      }
      noteText="Шинэ хурал оруулахдаа огноо, байршил, оролцогчдод очих мэдээллийг дутуу үлдээхгүйгээр бөглөөрэй."
    >
      {showForm ? (
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Шинэ бүртгэл</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хурал үүсгэх</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Гарчиг</span>
              <input
                type="text"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting((c) => ({ ...c, title: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Төлөв</span>
              <select
                value={newMeeting.status}
                onChange={(e) => setNewMeeting((c) => ({ ...c, status: e.target.value as MeetingStatus }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              >
                <option value="Төлөвлөсөн">Төлөвлөсөн</option>
                <option value="Баталгаажсан">Баталгаажсан</option>
                <option value="Цуцлагдсан">Цуцлагдсан</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Огноо</span>
              <input
                type="datetime-local"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting((c) => ({ ...c, date: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Байршил</span>
              <input
                type="text"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting((c) => ({ ...c, location: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSend}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Илгээх
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              Цуцлах
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Хуваарь</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ойрын хурлууд</h2>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Код</th>
                    <th className="px-4 py-3 font-medium">Гарчиг</th>
                    <th className="px-4 py-3 font-medium">Зохион байгуулагч</th>
                    <th className="px-4 py-3 font-medium">Огноо</th>
                    <th className="px-4 py-3 font-medium">Төлөв</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 font-medium text-slate-950">{item.id}</td>
                      <td className="px-4 py-4 text-slate-700">
                        <p className="font-medium text-slate-950">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.location}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{item.organizer}</td>
                      <td className="px-4 py-4 text-slate-700">{item.date}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Товч карт</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хурал бүрийн мэдээлэл</h2>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-card`} className="rounded-[24px] border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.id}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-400">Огноо</p>
                    <p className="mt-1 font-medium text-slate-950">{item.date}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-400">Байршил</p>
                    <p className="mt-1 font-medium text-slate-950">{item.location}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-slate-400">Зохион байгуулагч</p>
                    <p className="mt-1 font-medium text-slate-950">{item.organizer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DirectorShell>
  );
}
