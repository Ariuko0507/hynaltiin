'use client';

import { useState, useEffect } from "react";
import { DirectorShell } from "../_components/director-shell";
import { supabase, Meeting } from "@/lib/supabase";
import { getUnreadNotificationCount } from "@/app/_lib/notifications";

const directorData = {
  name: "Директор Энх",
  email: "director@example.com",
  role: "Директор",
  division: "Үйл ажиллагааны захиргаа",
  lastReview: "2026-04-13",
};

const quickStats = [
  { label: "Төсвийн гүйцэтгэл", value: "91%" },
  { label: "Стратегийн зорилт", value: "79%" },
  { label: "Шинэ түншлэл", value: "5" },
  { label: "Хүлээгдэж буй шийдвэр", value: "3" },
];

const highlights = [
  "Төсвийн гүйцэтгэл 91% байна.",
  "Стратегийн зорилт 79%-тай биелэгдэж байна.",
  "Шинэ түншлэл 5 байгуулж амжилттай.",
];

const tasks = [
  "Компани зорилтуудыг хүлээн зөвшөөрөх.",
  "Гүйцэтгэлийн тайланг харах.",
  "Хуваарь, стратеги хурлыг товлох.",
];

export default function DirectorDashboardPage() {
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    participants: '',
    description: ''
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = 1; // TODO: Get from auth context

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
      console.log('Хурлуудыг авах оролдлого...');
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Хурлуудыг авахад алдаа гарлаа:', error);
        // Хэрэв database алдаа гарвал жишээ өгөгдөл харуулна
        const sampleMeetings: Meeting[] = [
          {
            id: 1,
            meeting_id: 'meeting_001',
            title: 'Стратегийн хурал',
            description: 'Компанийн улирлын стратеги төлөвлөгөө',
            status: 'Эхэлсэн',
            organizer: 1,
            meeting_date: '2026-04-28',
            meeting_time: '10:00',
            participants: 'Директор, Менежерүүд',
            created_at: '2026-04-27T10:00:00Z',
            updated_at: '2026-04-27T10:00:00Z'
          }
        ];
        setMeetings(sampleMeetings);
        return;
      }
      
      console.log('Амжилттай авсан хурлууд:', data);
      setMeetings(data || []);
    } catch (error) {
      console.error('Хурлуудыг авахад алдаа гарлаа:', error);
    }
  };

  const handleCreateMeeting = async () => {
    console.log('Хурал үүсгэх товч дарлаа', meetingData);
    
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
      console.log('Хурал хадгалах оролдлого...', meetingData);
      
      // Database-д хурал хадгалах
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          meeting_id: `meeting_${Date.now()}`,
          title: meetingData.title,
          description: meetingData.description,
          meeting_date: meetingData.date,
          meeting_time: meetingData.time,
          participants: meetingData.participants,
          status: 'Эхэлсэн',
          organizer: 1 // Director ID
        });

      if (error) {
        console.error('Хурал хадгалахад алдаа гарлаа:', error);
        // Хэрэв database алдаа гарвал local state дээр нэмэх
        const newMeeting: Meeting = {
          id: Date.now(),
          meeting_id: `meeting_${Date.now()}`,
          title: meetingData.title,
          description: meetingData.description,
          status: 'Эхэлсэн',
          organizer: 1,
          meeting_date: meetingData.date,
          meeting_time: meetingData.time,
          participants: meetingData.participants,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setMeetings(prevMeetings => [newMeeting, ...prevMeetings]);
        alert('Хурал амжилттай үүсгэгдлээ (local state)!');
        return;
      }
      
      console.log('Хурал амжилттай хадгалагдлаа:', data);

      const meetingInfo = `
Хурал амжилттай үүсгэлээ!
Гарчиг: ${meetingData.title}
Огноо: ${meetingData.date}
Цаг: ${meetingData.time}
Оролцогчид: ${meetingData.participants || 'Байхгүй'}
Тайлбар: ${meetingData.description || 'Байхгүй'}`;
      
      alert(meetingInfo);
      
      // Формыг цэвэрлэх
      setMeetingData({
        title: '',
        date: '',
        time: '',
        participants: '',
        description: ''
      });
      setShowMeetingForm(false);
      
      // Хурлын жагсаалтыг шинэчлэх
      fetchMeetings();
      
    } catch (error) {
      console.error('Хурал үүсгэхэд алдаа гарлаа:', error);
      alert('Хурал үүсгэхэд алдаа гарлаа!');
    }
  };

  const handleCancelMeeting = () => {
    setMeetingData({
      title: '',
      date: '',
      time: '',
      participants: '',
      description: ''
    });
    setShowMeetingForm(false);
  };

  return (
    <DirectorShell
      currentPath="/director/dashboard"
      kicker="Director"
      title="Директорын самбар"
      description="Стратеги, гүйцэтгэл, төслийн тоймыг нэг дороос хянах."
      stats={[
        { label: "Нийт төсөл", value: "12" },
        { label: "Идэвхтэй", value: "8" },
        { label: "Биелэлт хүлээж буй", value: "3" },
        { label: "Хурал", value: "5" },
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
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">И-мэйл</p>
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Албан тушаал</p>
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Тасаг</p>
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.division}</p>
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

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Хурал</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хурал үүсгэх</h2>
            
            {!showMeetingForm ? (
              <div className="mt-6">
                <button
                  onClick={() => setShowMeetingForm(true)}
                  className="w-full rounded-2xl bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Шинэ хурал товлох
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Хурлын гарчиг</label>
                  <input
                    type="text"
                    value={meetingData.title}
                    onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Цаг</label>
                    <input
                      type="time"
                      value={meetingData.time}
                      onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Оролцогчид</label>
                  <input
                    type="text"
                    value={meetingData.participants}
                    onChange={(e) => setMeetingData({...meetingData, participants: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Оролцогчдыг таслалаар тусгаарлан оруулна уу"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Тайлбар</label>
                  <textarea
                    value={meetingData.description}
                    onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Хурлын талаар товч тайлбар"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Илгээх товч дарлаа');
                      handleCreateMeeting();
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 text-white px-6 py-3 font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Хурал илгээх
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Цуцлах товч дарлаа');
                      handleCancelMeeting();
                    }}
                    className="flex-1 rounded-xl bg-red-600 text-white px-6 py-3 font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Цуцлах
                  </button>
                </div>
              </div>
            )}
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Тайлан</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Төсвийн гүйцэтгэлийн тайлан</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                2026 оны улирал
              </span>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Гүйцэтгэлийн тойм</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Нийт төсөв</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-900">₮50.0M</p>
                      </div>
                      <div className="rounded-full bg-emerald-100 p-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Зарцуулалт</p>
                        <p className="mt-1 text-2xl font-bold text-blue-900">₮45.5M</p>
                      </div>
                      <div className="rounded-full bg-blue-100 p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700 font-medium">Үлдэгдэл</p>
                        <p className="mt-1 text-2xl font-bold text-amber-900">₮4.5M</p>
                      </div>
                      <div className="rounded-full bg-amber-100 p-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-purple-50 border border-purple-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Гүйцэтгэл</p>
                        <p className="mt-1 text-2xl font-bold text-purple-900">91%</p>
                      </div>
                      <div className="rounded-full bg-purple-100 p-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Зарлагын дэлгэрэнгүй</h3>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Цалин хөлс</p>
                        <p className="text-xs text-slate-500 mt-1">Ажилчдын сардлаг</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-900">₮25.0M</p>
                        <p className="text-xs text-slate-500">55%</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-slate-600 h-2 rounded-full" style={{width: '55%'}}></div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Тээвэр логистик</p>
                        <p className="text-xs text-slate-500 mt-1">Тээврийн зардал</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-900">₮8.5M</p>
                        <p className="text-xs text-slate-500">19%</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-slate-600 h-2 rounded-full" style={{width: '19%'}}></div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Тоног төхөөрөмж</p>
                        <p className="text-xs text-slate-500 mt-1">Шинэчлэл, засвар</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-900">₮6.0M</p>
                        <p className="text-xs text-slate-500">13%</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-slate-600 h-2 rounded-full" style={{width: '13%'}}></div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Маркетинг, сурталчилгаа</p>
                        <p className="text-xs text-slate-500 mt-1">Брэнд, зар сурталчилгаа</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-900">₮4.0M</p>
                        <p className="text-xs text-slate-500">9%</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-slate-600 h-2 rounded-full" style={{width: '9%'}}></div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Бусад зардал</p>
                        <p className="text-xs text-slate-500 mt-1">Түлээ, усаар хангах, гэх мэт</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-slate-900">₮2.0M</p>
                        <p className="text-xs text-slate-500">4%</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-slate-600 h-2 rounded-full" style={{width: '4%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Хурал</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хурлын жагсаалт</h2>
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                {meetings.length} хурал
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {meetings.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-slate-600">Одоогоор хурал байхгүй байна</p>
                  <p className="text-xs text-slate-500 mt-1">Шинэ хурал товлоорой</p>
                </div>
              ) : (
                meetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{meeting.title}</h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            meeting.status === 'Эхэлсэн' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : meeting.status === 'Зассан'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>
                        
                        {meeting.description && (
                          <p className="text-sm text-slate-600 mb-2">{meeting.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {meeting.meeting_date && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {meeting.meeting_date}
                            </div>
                          )}
                          
                          {meeting.meeting_time && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {meeting.meeting_time}
                            </div>
                          )}
                        </div>
                        
                        {meeting.participants && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {meeting.participants}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </DirectorShell>
  );
}
