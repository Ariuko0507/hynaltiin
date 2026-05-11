//mployee/meeting/page.tsx//
"use client";

import { useState, useEffect } from "react";
import { EmployeeShell } from "../_components/employee-shell";
import { VoiceRecorder } from "@/app/_components/voice-recorder";

type MeetingStatus = "Төлөвлөсөн" | "Баталгаажсан" | "Цуцлагдсан";

type MeetingItem = {
  id: number;
  meeting_id: string;
  title: string;
  status: MeetingStatus;
  organizer: string;
  organizer_id: number;
  date: string;
  location: string;
  description?: string;
  manager_reaction?: string;
  manager_comment?: string;
};


function getStatusClasses(status: MeetingStatus) {
  if (status === "Баталгаажсан") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Төлөвлөсөн") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-rose-100 text-rose-700";
}

export default function EmployeeMeetingPage() {
  const [items, setItems] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed'>('all');
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    status: "Төлөвлөсөн" as MeetingStatus,
    date: "",
    location: "",
    description: "",
  });
  const userId = 4; // TODO: Get from auth context

  // Fetch meetings from database
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/meetings?userId=${userId}&userRole=employee`);
      const data = await response.json();
      if (data.meetings) {
        const formattedMeetings = data.meetings.map((m: any) => ({
          id: m.id,
          meeting_id: m.meeting_id,
          title: m.title,
          status: m.status,
          organizer: m.organizer?.name || 'Unknown',
          organizer_id: m.organizer_id,
          date: new Date(m.meeting_date).toLocaleString('mn-MN'),
          location: m.location || '',
          description: m.description,
          manager_reaction: m.manager_reaction,
          manager_comment: m.manager_comment,
        }));
        setItems(formattedMeetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Баталгаажсан хурлууд
  const confirmedMeetings = items.filter(item => item.status === "Баталгаажсан");

  const handleSend = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.location) {
      return;
    }

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMeeting.title,
          description: newMeeting.description,
          status: newMeeting.status,
          meeting_date: newMeeting.date,
          location: newMeeting.location,
          organizer_id: userId,
        }),
      });

      if (response.ok) {
        await fetchMeetings();
        setNewMeeting({ title: "", status: "Төлөвлөсөн", date: "", location: "", description: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <EmployeeShell
      currentPath="/employee/meeting"
      kicker="Meetings"
      title="Хурал, уулзалтын хуваарь"
      description="Өөрийн оролцох хурал, зохион байгуулагч, хугацаа болон байршлыг нэг ижил загвартайгаар харж, шаардлагатай үед шинэ уулзалт үүсгэнэ."
      stats={[
        { label: "Энэ 7 хоног", value: "5" },
        { label: "Баталгаажсан", value: "3" },
        { label: "Төлөвлөсөн", value: "1" },
        { label: "Цуцлагдсан", value: "1" },
      ]}
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
                onChange={(event) =>
                  setNewMeeting((current) => ({ ...current, title: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Төлөв</span>
              <select
                value={newMeeting.status}
                onChange={(event) =>
                  setNewMeeting((current) => ({
                    ...current,
                    status: event.target.value as MeetingStatus,
                  }))
                }
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
                onChange={(event) =>
                  setNewMeeting((current) => ({ ...current, date: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Байршил</span>
              <input
                type="text"
                value={newMeeting.location}
                onChange={(event) =>
                  setNewMeeting((current) => ({ ...current, location: event.target.value }))
                }
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
              onClick={() => setActiveTab('confirmed')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'confirmed'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Баталгаажсан ({confirmedMeetings.length})
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Ачааллаж байна...
                    </td>
                  </tr>
                ) : (activeTab === 'all' ? items : confirmedMeetings).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Хурал олдсонгүй
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'all' ? items : confirmedMeetings).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 font-medium text-slate-950">{item.meeting_id}</td>
                      <td className="px-4 py-4 text-slate-700">
                        <p className="font-medium text-slate-950">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.location}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{item.organizer}</td>
                      <td className="px-4 py-4 text-slate-700">{item.date}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {activeTab === 'confirmed' && confirmedMeetings.length === 0 && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">Баталгаажсан хурал олдсонгүй</p>
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
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Ачааллаж байна...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Хурал олдсонгүй
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedMeeting(item)}
                        className="cursor-pointer transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 font-medium text-slate-950">{item.meeting_id}</td>
                        <td className="px-4 py-4 text-slate-700">
                          <p className="font-medium text-slate-950">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.location}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{item.organizer}</td>
                        <td className="px-4 py-4 text-slate-700">{item.date}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{selectedMeeting.meeting_id}</p>
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
              {selectedMeeting.description && (
                <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Тайлбар</p>
                  <p className="mt-2 font-medium text-slate-950">{selectedMeeting.description}</p>
                </div>
              )}
              {selectedMeeting.manager_reaction && (
                <div className="rounded-2xl bg-emerald-50 p-4 md:col-span-2">
                  <p className="text-xs text-emerald-600 uppercase tracking-[0.24em]">Менежерийн хариу</p>
                  <p className="mt-2 font-medium text-emerald-700">{selectedMeeting.manager_reaction}</p>
                  {selectedMeeting.manager_comment && (
                    <p className="mt-1 text-sm text-emerald-600">{selectedMeeting.manager_comment}</p>
                  )}
                </div>
              )}
            </div>

            {/* Voice Recorder Section */}
            <div className="mt-6">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-400">Дуу бичлэг</p>
              <VoiceRecorder
                meetingId={selectedMeeting.meeting_id}
                userId={userId}
                onRecordingSaved={() => {
                  console.log("Recording saved for meeting:", selectedMeeting.meeting_id);
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
    </EmployeeShell>
  );
}
