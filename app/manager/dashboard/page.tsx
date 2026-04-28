'use client';

import { useState, useEffect } from "react";
import { ManagerShell } from "../_components/manager-shell";
import { getUnreadNotificationCount } from "@/app/_lib/notifications";
import { supabase } from "@/lib/supabase";

const managerData = {
  name: "Менежер Тэмүүжин",
  email: "manager@example.com",
  role: "Менежер",
  department: "Төсөл хэрэгжүүлэлт",
  lastReview: "2026-04-20",
};

const quickStats = [
  { label: "Багийн гүйцэтгэл", value: "87%" },
  { label: "Төслийн биелэлт", value: "12/15" },
  { label: "Хүлээгдэж буй даалгавар", value: "8" },
  { label: "Идэвхтэй ажилтан", value: "6" },
];

const highlights = [
  "Багийн гүйцэтгэл 87% байна.",
  "15 төслөөс 12 нь хугацаанд биелэгдэж байна.",
  "8 шинэ даалгавар хүлээгдэж байна.",
];

const initialTasks = [
  "Багийн гишүүдэд даалгавар тараах.",
  "Төслийн явцын тайланг шалгах.",
  "Хурлын товлолт, бэлтгэл хийх.",
];

export default function ManagerDashboardPage() {
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = 2; // TODO: Get from auth context
  const [tasks, setTasks] = useState<string[]>(initialTasks);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  // Database-ээс meetings-ийг авах
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      console.log('Manager - Хурлуудыг авах оролдлого...');
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('meeting_date', { ascending: true });
      
      if (error) {
        console.error('Manager - Хурлуудыг авахад алдаа гарлаа:', error);
        return;
      }
      
      console.log('Manager - Амжилттай авсан хурлууд:', data);
      setMeetings(data || []);
    } catch (error) {
      console.error('Manager - Хурлуудыг авахад алдаа гарлаа:', error);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingData.title.trim()) {
      alert('Хурлын гарчиг оруулна уу!');
      return;
    }
    
    if (!meetingData.date) {
      alert('Огноо сонгоно уу!');
      return;
    }
    
    if (!meetingData.time) {
      alert('Цаг сонгоно уу!');
      return;
    }

    try {
      console.log('Manager - Хурал хадгалах оролдлого...', meetingData);
      console.log('Supabase URL:', (process.env as any).NEXT_PUBLIC_SUPABASE_URL);
      
      const insertData = {
        meeting_id: `meeting_${Date.now()}`,
        title: meetingData.title,
        description: meetingData.description,
        meeting_date: meetingData.date,
        meeting_time: meetingData.time,
        status: 'scheduled',
        organizer: 'Менежер Тэмүүжин',
        participants: 'Багийн гишүүд'
      };
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('meetings')
        .insert(insertData);

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Manager - Хурал хадгалахад алдаа гарлаа:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert('Хурал хадгалахад алдаа гарлаа: ' + JSON.stringify(error));
        return;
      }
      
      console.log('Manager - Хурал амжилттай хадгалагдлаа:', data);
      alert('Хурал амжилттай товлогдлоо!');
      
      setMeetingData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });
      setShowMeetingForm(false);
      fetchMeetings();
      
    } catch (error) {
      console.error('Manager - Хурал үүсгэхэд алдаа гарлаа:', error);
      console.error('Catch error details:', JSON.stringify(error, null, 2));
      alert('Хурал үүсгэхэд алдаа гарлаа!');
    }
  };

  // Fetch notification count
  useEffect(() => {
    getUnreadNotificationCount(userId).then(setNotificationCount);
  }, [userId]);

  return (
    <ManagerShell
      currentPath="/manager/dashboard"
      kicker="Manager"
      title="Менежерийн самбар"
      description="Багийн ажил, төсөл, гүйцэтгэлийг хянах."
      stats={[
        { label: "Нийт даалгавар", value: "12" },
        { label: "Хийгдэж буй", value: "5" },
        { label: "Хүлээгдэж буй", value: "3" },
        { label: "Дууссан", value: "4" },
      ]}
      notifications={notificationCount}
      userId={userId}
    >
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Профайл</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Миний мэдээлэл</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Active
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Нэр</p>
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">И-мэйл</p>
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Албан тушаал</p>
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Хэлтэс</p>
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.department}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Өнөөдрийн фокус</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хийх зүйлс</h2>
            <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
              {tasks.map((task) => (
                <div key={task} className="rounded-2xl bg-slate-50 p-4">
                  {task}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Тойм</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Товч тойм</h2>
            <div className="mt-6 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Хурал</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Багийн хурал</h2>
              </div>
              <button
                onClick={() => setShowMeetingForm(true)}
                className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Хурал товлох
              </button>
            </div>
            
            {!showMeetingForm ? (
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Удахгүй болох хурлууд:</p>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    {meetings.length === 0 ? (
                      <li className="text-slate-500">Одоогоор хурал товлогдоогүй байна</li>
                    ) : (
                      meetings.slice(0, 3).map((meeting) => (
                        <li key={meeting.id} className="flex items-center gap-2">
                          <span className={
                            meeting.status === 'scheduled' ? 'text-blue-500' :
                            meeting.status === 'completed' ? 'text-emerald-500' :
                            'text-amber-500'
                          }>•</span>
                          <span>
                            {meeting.title} - {meeting.meeting_date} {meeting.meeting_time}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Хурлын гарчиг</label>
                  <input
                    type="text"
                    value={meetingData.title}
                    onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Хурлын гарчиг оруулна уу"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Огноо</label>
                    <input
                      type="date"
                      value={meetingData.date}
                      onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Цаг</label>
                    <input
                      type="time"
                      value={meetingData.time}
                      onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Байршил</label>
                  <input
                    type="text"
                    value={meetingData.location}
                    onChange={(e) => setMeetingData({...meetingData, location: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Хурлын байршил оруулна уу"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Тайлбар</label>
                  <textarea
                    value={meetingData.description}
                    onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Хурлын талаар товч тайлбар"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateMeeting}
                    className="flex-1 rounded-xl bg-emerald-600 text-white px-6 py-3 font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Хурал товлох
                  </button>
                  <button
                    onClick={() => {
                      setMeetingData({ title: '', date: '', time: '', location: '', description: '' });
                      setShowMeetingForm(false);
                    }}
                    className="flex-1 rounded-xl bg-red-600 text-white px-6 py-3 font-medium hover:bg-red-700 transition-colors"
                  >
                    Цуцлах
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </ManagerShell>
  );
}
