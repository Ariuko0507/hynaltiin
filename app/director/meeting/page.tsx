"use client";

import { useState, useEffect, useMemo } from "react";
import { DirectorShell } from "../_components/director-shell";
import { VoiceRecorder } from "@/app/_components/voice-recorder";
import { VoiceRecorderSimple } from "@/app/_components/voice-recorder-simple";
import { supabase } from "@/lib/supabase";
import { getUnreadNotificationCount, createNotification } from "@/app/_lib/notifications";

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
  if (status === "Баталгаажсан") return "bg-emerald-100 text-emerald-700";
  if (status === "Төлөвлөсөн") return "bg-sky-100 text-sky-700";
  return "bg-rose-100 text-rose-700";
}

// ── Meeting Page ──────────────────────────────────────────────────────────────

const initialMeetingItems: MeetingItem[] = [];

export default function DirectorMeetingPage() {
  const [items, setItems] = useState(initialMeetingItems);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    status: "Төлөвлөсөн" as MeetingStatus,
    date: "",
    location: "",
    description: "",
    participants: [] as string[],
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = 1; // TODO: Get from auth context

  // Статистик тооцоолох
  const meetingStats = useMemo(() => {
    const thisWeek = items.filter(item => {
      const meetingDate = new Date(item.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return meetingDate >= today && meetingDate <= weekFromNow;
    }).length;
    
    const confirmed = items.filter(item => item.status === 'Баталгаажсан').length;
    const planned = items.filter(item => item.status === 'Төлөвлөсөн').length;
    const cancelled = items.filter(item => item.status === 'Цуцлагдсан').length;
    
    return [
      { label: "Энэ 7 хоног", value: thisWeek.toString() },
      { label: "Баталгаажсан", value: confirmed.toString() },
      { label: "Төлөвлөсөн", value: planned.toString() },
      { label: "Цуцлагдсан", value: cancelled.toString() },
    ];
  }, [items]);

  // Database-ээс manager-уудыг авах
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      console.log('Director - Manager-уудыг авах оролдлого...');
      
      // Fetch all users (role column doesn't exist, filter manually)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, department_id')
        .order('name');
      
      if (error) {
        console.error('Director - Manager-уудыг авахад алдаа гарлаа:', error?.message || error);
        // Fallback data
        setManagers([
          { id: "manager1", name: "Менежер Бат", department_id: 3 },
          { id: "manager2", name: "Менежер Тэмүүжин", department_id: 3 },
          { id: "manager3", name: "Менежер Саран", department_id: 4 },
          { id: "manager4", name: "Менежер Баяр", department_id: 4 },
          { id: "manager5", name: "Менежер Оюун", department_id: 4 },
        ]);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Director - Manager-ууд:', data);
        setManagers(data);
      } else {
        // Use fallback if no data
        setManagers([
          { id: "manager1", name: "Менежер Бат", department_id: 3 },
          { id: "manager2", name: "Менежер Тэмүүжин", department_id: 3 },
          { id: "manager3", name: "Менежер Саран", department_id: 4 },
          { id: "manager4", name: "Менежер Баяр", department_id: 4 },
          { id: "manager5", name: "Менежер Оюун", department_id: 4 },
        ]);
      }
    } catch (error) {
      console.error('Director - Manager-уудыг авахад алдаа гарлаа:', error instanceof Error ? error.message : error);
      // Fallback data
      setManagers([
        { id: "manager1", name: "Менежер Бат", department_id: 3 },
        { id: "manager2", name: "Менежер Тэмүүжин", department_id: 3 },
        { id: "manager3", name: "Менежер Саран", department_id: 4 },
        { id: "manager4", name: "Менежер Баяр", department_id: 4 },
        { id: "manager5", name: "Менежер Оюун", department_id: 4 },
      ]);
    }
  };

  const handleParticipantToggle = (managerId: string) => {
    setNewMeeting(prev => ({
      ...prev,
      participants: prev.participants.includes(managerId)
        ? prev.participants.filter(id => id !== managerId)
        : [...prev.participants, managerId]
    }));
  };

  // Database-ээс хурлуудыг авах
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Fetch notification count
  useEffect(() => {
    getUnreadNotificationCount(userId).then(setNotificationCount);
  }, [userId]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/meetings?userId=${userId}&userRole=manager`);
      const data = await response.json();
      if (data.meetings) {
        const formattedItems: MeetingItem[] = data.meetings.map((m: any) => ({
          id: m.id,
          meeting_id: m.meeting_id,
          title: m.title,
          status: m.status,
          organizer: m.organizer?.name || 'Директор Энх',
          organizer_id: m.organizer_id,
          date: new Date(m.meeting_date).toLocaleString('mn-MN'),
          location: m.location || 'Төв байр, хурлын танхим',
          description: m.description,
          manager_reaction: m.manager_reaction,
          manager_comment: m.manager_comment,
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Meeting page - Хурлуудыг авахад алдаа гарлаа:', error);
    }
  };

  const handleSend = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.location) {
      alert('Бүх талбарыг бөглөнө үү!');
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
        // Send notifications to participating managers
        if (newMeeting.participants.length > 0) {
          for (const managerId of newMeeting.participants) {
            const manager = managers.find(m => m.id === managerId);
            if (manager) {
              await createNotification(
                Number(manager.id),
                'Шинэ хурал',
                `Директор танд хурал товлож байна: ${newMeeting.title}`,
                'meeting',
                '/director/meeting'
              );
            }
          }
        }
        
        alert('Хурал амжилттай үүсгэгдлээ!');
        await fetchMeetings();
        setNewMeeting({ title: "", status: "Төлөвлөсөн", date: "", location: "", description: "", participants: [] });
        setShowForm(false);
      } else {
        alert('Хурал үүсгэхэд алдаа гарлаа!');
      }
    } catch (error) {
      console.error('Meeting page - Хурал үүсгэхэд алдаа гарлаа:', error);
      alert('Хурал үүсгэхэд алдаа гарлаа!');
    }
  };

  return (
    <DirectorShell
      currentPath="/director/meeting"
      kicker="Meetings"
      title="Хурал, уулзалтын хуваарь"
      description="Өөрийн оролцох хурал, зохион байгуулагч, хугацаа болон байршлыг нэг ижил загвартайгаар харж, шаардлагатай үед шинэ уулзалт үүсгэнэ."
      stats={meetingStats}
      notifications={notificationCount}
      userId={userId}
      action={
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 hover:shadow-lg"
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {selectedMeeting.meeting_id}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedMeeting.title}
                </h2>
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
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                Дуу бичлэг
              </p>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600">Бичлэг + Текст (Transcription)</p>
                  <VoiceRecorder
                    meetingId={selectedMeeting.meeting_id}
                    userId={2} // TODO: Get from auth context
                    onRecordingSaved={() => {
                      console.log("Recording saved for meeting:", selectedMeeting.id);
                    }}
                    maxDuration={600}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600">Бичлэг (Simple)</p>
                  <VoiceRecorderSimple
                    meetingId={selectedMeeting.meeting_id}
                    userId={2} // TODO: Get from auth context
                    onRecordingSaved={() => {
                      console.log("Recording saved for meeting:", selectedMeeting.id);
                    }}
                    maxDuration={600}
                  />
                </div>
              </div>
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
    </DirectorShell>
  );
}
