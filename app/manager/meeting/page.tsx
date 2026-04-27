//manager/meeting/page.tsx
"use client";

import { useState } from "react";
import { ManagerShell } from "../_components/manager-shell";
import { VoiceRecorder } from "@/app/_components/voice-recorder";

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

const initialMeetingItems: MeetingItem[] = [
  {
    id: "M-001",
    title: "Багийн сарын хурал",
    status: "Баталгаажсан",
    organizer: "Менежер Тэмүүжин",
    date: "2026-04-29 10:00",
    location: "2 давхар, хурлын өрөө B",
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
    title: "Ажилтнуудын үнэлгээний хурал",
    status: "Төлөвлөсөн",
    organizer: "Менежер Тэмүүжин",
    date: "2026-05-02 09:00",
    location: "Төв байр, хурлын танхим",
  },
];

export default function ManagerMeetingPage() {
  const [items, setItems] = useState<MeetingItem[]>(initialMeetingItems);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    status: "Төлөвлөсөн" as MeetingStatus
  });

  // Таб state
  const [activeTab, setActiveTab] = useState<'all' | 'team'>('all');

  // Багийн хуралнууд
  const teamMeetings = items.filter(item => 
    item.title.includes('Багийн') || 
    item.title.includes('сарын') || 
    item.title.includes('ажилтан')
  );

  // Илүү олон хуралнууд
  const otherMeetings = items.filter(item => !teamMeetings.includes(item));

  const handleSend = () => {
    if (!newMeeting.title.trim() || !newMeeting.date || !newMeeting.time) {
      alert("Гарчиг, огноо болон цаг оруулна уу");
      return;
    }

    const newItem: MeetingItem = {
      id: `M-${String(items.length + 1).padStart(3, "0")}`,
      title: newMeeting.title,
      status: "Төлөвлөсөн",
      organizer: "Менежер Тэмүүжин",
      date: `${newMeeting.date} ${newMeeting.time}`,
      location: newMeeting.location
    };

    setItems([newItem, ...items]);
    setNewMeeting({ title: "", date: "", time: "", location: "", description: "", status: "Төлөвлөсөн" as MeetingStatus });
    setShowForm(false);
  };

  return (
    <ManagerShell
      currentPath="/manager/meeting"
      kicker="Meetings"
      title="Хурал, уулзалтын хуваарь"
      description="Багийн хурал, уулзалтыг товлон, хуваарь гаргах."
      stats={[
        { label: "Энэ 7 хоног", value: "3" },
        { label: "Баталгаажсан", value: "1" },
        { label: "Төлөвлөсөн", value: "2" },
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

      {/* Таб хэсэг */}
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Хурлын ангилал</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хурал, уулзалт</h2>
          </div>
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Бүх хурал ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'team'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Багийн хурал ({teamMeetings.length})
            </button>
          </div>
        </div>

        {/* Таб контент */}
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
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
                {(activeTab === 'all' ? items : teamMeetings).map((item) => (
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

        {activeTab === 'team' && teamMeetings.length === 0 && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">Багийн хурал олдсонгүй</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Багийн хурал үүсгэх
            </button>
          </div>
        )}
      </section>

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
                    <tr
                      key={item.id}
                      onClick={() => setSelectedMeeting(item)}
                      className="cursor-pointer transition hover:bg-slate-50"
                    >
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
      </section>

      {/* Meeting Detail Modal with Voice Recorder */}
      {selectedMeeting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{selectedMeeting.id}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedMeeting.title}</h2>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Meeting Details */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Зохион байгуулагч</p>
                <p className="mt-2 font-medium text-slate-950">{selectedMeeting.organizer}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Огноо</p>
                <p className="mt-2 font-medium text-slate-950">{selectedMeeting.date}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Байршил</p>
                <p className="mt-2 font-medium text-slate-950">{selectedMeeting.location}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Төлөв</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(selectedMeeting.status)}`}>
                  {selectedMeeting.status}
                </span>
              </div>
            </div>

            {/* Voice Recorder Section */}
            <div className="mt-6">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-400">Дуу бичлэг</p>
              <VoiceRecorder
                meetingId={selectedMeeting.id}
                userId={3} // TODO: Get from auth context
                onRecordingSaved={() => {
                  console.log("Recording saved for meeting:", selectedMeeting.id);
                }}
                maxDuration={600}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerShell>
  );
}
