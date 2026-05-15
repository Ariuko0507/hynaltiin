//manager/meeting/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ManagerShell } from "../_components/manager-shell";
import { getUnreadNotificationCount } from "@/app/_lib/notifications";
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
  description?: string | null;
  manager_reaction?: string;
  manager_comment?: string;
  team_id?: number;
};

type MeetingApiItem = {
  id: number;
  meeting_id?: string | null;
  meeting_code?: string | null;
  title: string;
  status: MeetingStatus | "scheduled" | "completed" | "cancelled";
  organizer?: { name?: string | null } | null;
  organizer_id: number;
  meeting_date: string;
  location?: string | null;
  description?: string | null;
  manager_reaction?: string | null;
  manager_comment?: string | null;
  team_id?: number | null;
};

type RecordingApiItem = {
  id: number | string;
  transcription?: string | null;
};

function resolveMeetingIdentifier(input: { meeting_id?: string | null; meeting_code?: string | null; id: number }) {
  const meetingId = typeof input.meeting_id === "string" ? input.meeting_id.trim() : "";
  if (meetingId) return meetingId;
  const meetingCode = typeof input.meeting_code === "string" ? input.meeting_code.trim() : "";
  if (meetingCode) return meetingCode;
  return `MTG-${input.id}`;
}

function normalizeMeetingStatus(status: MeetingApiItem["status"]): MeetingStatus {
  if (status === "completed") return "Баталгаажсан";
  if (status === "cancelled") return "Цуцлагдсан";
  if (status === "scheduled") return "Төлөвлөсөн";
  return status;
}

function mapApiMeetingToItem(m: MeetingApiItem): MeetingItem {
  return {
    id: m.id,
    meeting_id: resolveMeetingIdentifier(m),
    title: m.title,
    status: normalizeMeetingStatus(m.status),
    organizer: m.organizer?.name || "Unknown",
    organizer_id: m.organizer_id,
    date: new Date(m.meeting_date).toLocaleString("mn-MN"),
    location: m.location ?? "",
    description: m.description ?? undefined,
    manager_reaction: m.manager_reaction ?? undefined,
    manager_comment: m.manager_comment ?? undefined,
    team_id: m.team_id ?? undefined,
  };
}

function getStatusClasses(status: MeetingStatus) {
  if (status === "Баталгаажсан") return "bg-emerald-100 text-emerald-700";
  if (status === "Төлөвлөсөн") return "bg-sky-100 text-sky-700";
  return "bg-rose-100 text-rose-700";
}


export default function ManagerMeetingPage() {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = 2; // TODO: Get from auth context
  const [items, setItems] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [showReactionForm, setShowReactionForm] = useState(false);
  const [showMeetingTab, setShowMeetingTab] = useState(false);
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    status: "Төлөвлөсөн" as MeetingStatus,
  });
  const [reaction, setReaction] = useState({
    status: "Баталгаажсан" as MeetingStatus,
    manager_reaction: "",
    manager_comment: ""
  });

  // Таб state
  const [activeTab, setActiveTab] = useState<'all' | 'team'>('all');

  // Багийн хуралнууд
  const teamMeetings = items.filter(item => 
    item.title.includes('Багийн') || 
    item.title.includes('сарын') || 
    item.title.includes('ажилтан')
  );


  const handleSend = async () => {
    if (!newMeeting.title.trim() || !newMeeting.date) {
      alert("Гарчиг, огноо оруулна уу");
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
        setNewMeeting({
          title: "",
          date: "",
          time: "",
          location: "",
          description: "",
          status: "Төлөвлөсөн" as MeetingStatus,
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleReaction = async () => {
    if (!selectedMeeting) return;

    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reaction.status,
          manager_reaction: reaction.manager_reaction,
          manager_comment: reaction.manager_comment,
        }),
      });

      if (response.ok) {
        await fetchMeetings();
        setShowReactionForm(false);
        setReaction({ status: "Баталгаажсан", manager_reaction: "", manager_comment: "" });
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  // Fetch notification count and meetings
  useEffect(() => {
    getUnreadNotificationCount(userId).then(setNotificationCount);
    fetchMeetings();
  }, [userId]);

  // Fetch transcripts when a meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      fetchTranscripts(selectedMeeting.meeting_id || `MTG-${selectedMeeting.id}`);
    }
  }, [selectedMeeting]);

  const fetchTranscripts = async (meetingId: string) => {
    if (!meetingId?.trim()) return;
    try {
      const response = await fetch(`/api/recordings/list?meetingId=${meetingId}`);
      if (response.ok) {
        const data = await response.json();
        const recordings = (data.recordings || []) as RecordingApiItem[];
        const transcriptMap: Record<string, string> = {};
        recordings.forEach((rec) => {
          if (rec.transcription) {
            transcriptMap[String(rec.id)] = rec.transcription;
          }
        });
        setTranscripts(transcriptMap);
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/meetings?userId=${userId}&userRole=manager`);
      const data = await response.json();
      if (data.meetings) {
        const formattedMeetings = (data.meetings as MeetingApiItem[]).map(mapApiMeetingToItem);
        setItems(formattedMeetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
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
      notifications={notificationCount}
      userId={userId}
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
          <button
            type="button"
            onClick={() => setShowMeetingTab(!showMeetingTab)}
            className="text-left group"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Хурал, уулзалт</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 group-hover:text-slate-700 transition">Хурал, уулзалт</h2>
          </button>
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
        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Жагсаалт</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{(activeTab === 'all' ? items : teamMeetings).length} хурал</h2>

            <div className="overflow-hidden rounded-[24px] border border-slate-200 mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Код</th>
                      <th className="px-4 py-3 font-medium">Гарчиг</th>
                      <th className="px-4 py-3 font-medium">Төлөв</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                          Ачааллаж байна...
                        </td>
                      </tr>
                    ) : (activeTab === 'all' ? items : teamMeetings).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                          Хурал олдсонгүй
                        </td>
                      </tr>
                    ) : (
                      (activeTab === 'all' ? items : teamMeetings).map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            console.log('Selected meeting:', item);
                            setSelectedMeeting(item);
                          }}
                          className={`cursor-pointer transition ${
                            selectedMeeting?.id === item.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-4 font-medium text-slate-950">{item.meeting_id}</td>
                          <td className="px-4 py-4 text-slate-700">
                            <p className="font-medium text-slate-950">{item.title}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(item.status)}`}>
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
          </article>
        </div>

        {/* Meeting Detail Panel */}
        {selectedMeeting && (
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            {(() => {
              const recorderMeetingId = selectedMeeting.meeting_id?.trim() || `MTG-${selectedMeeting.id}`;
              return (
                <>
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
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Зохион байгуулагч</p>
                    <p className="text-lg font-bold text-slate-950">{selectedMeeting.organizer}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-purple-100 p-3">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Огноо</p>
                    <p className="text-lg font-bold text-slate-950">{selectedMeeting.date}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Байршил</p>
                    <p className="text-lg font-bold text-slate-950">{selectedMeeting.location}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-amber-100 p-3">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Төлөв</p>
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(selectedMeeting.status)}`}>
                      {selectedMeeting.status}
                    </span>
                  </div>
                </div>
              </div>
              {selectedMeeting.description && (
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200 md:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-sky-100 p-3">
                      <span className="text-xl">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Тайлбар</p>
                      <p className="text-sm font-medium text-slate-700">{selectedMeeting.description}</p>
                    </div>
                  </div>
                </div>
              )}
              {selectedMeeting.manager_reaction && (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border border-emerald-200 md:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-200 p-3">
                      <span className="text-xl">✅</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-emerald-600 uppercase tracking-wider mb-2">Менежерийн хариу</p>
                      <p className="text-sm font-medium text-emerald-700">{selectedMeeting.manager_reaction}</p>
                      {selectedMeeting.manager_comment && (
                        <p className="mt-1 text-sm text-emerald-600">{selectedMeeting.manager_comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Voice Recorder Section */}
            <div className="mt-6">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-400">Дуу бичлэг</p>
              <VoiceRecorder
                meetingId={recorderMeetingId}
                userId={userId}
                onRecordingSaved={() => {
                  fetchTranscripts(recorderMeetingId);
                  router.push("/manager/tasks");
                }}
                maxDuration={600}
              />
            </div>

            {/* Voice Transcript Section */}
            {Object.keys(transcripts).length > 0 && (
              <div className="mt-6">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-400">Дуу бичлэгийн текст</p>
                <div className="space-y-3">
                  {Object.entries(transcripts).map(([id, text]) => (
                    <div key={id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manager Reaction Form */}
            {showReactionForm && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-400">Менежерийн хариу</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Төлөв</span>
                    <select
                      value={reaction.status}
                      onChange={(e) => setReaction((c) => ({ ...c, status: e.target.value as MeetingStatus }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    >
                      <option value="Төлөвлөсөн">Төлөвлөсөн</option>
                      <option value="Баталгаажсан">Баталгаажсан</option>
                      <option value="Цуцлагдсан">Цуцлагдсан</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Хариу</span>
                    <input
                      type="text"
                      value={reaction.manager_reaction}
                      onChange={(e) => setReaction((c) => ({ ...c, manager_reaction: e.target.value }))}
                      placeholder="Жишээ: Зөвшөөрсөн, Хоцорсон гэх мэт"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Санал</span>
                    <textarea
                      value={reaction.manager_comment}
                      onChange={(e) => setReaction((c) => ({ ...c, manager_comment: e.target.value }))}
                      placeholder="Нэмэлт тайлбар"
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleReaction}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Илгээх
                  </button>
                  <button
                    onClick={() => setShowReactionForm(false)}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                  >
                    Цуцлах
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowReactionForm(!showReactionForm)}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {showReactionForm ? 'Хаах' : 'Хариу өгөх'}
              </button>
            </div>
                </>
              );
            })()}
          </article>
        )}
        </div>
      </section>
    </ManagerShell>
  );
}
