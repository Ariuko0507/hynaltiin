"use client";

import { useState, useEffect } from "react";
import { DepartmentHeadShell } from "../_components/department-head-shell";

type MeetingStatus = "Төлөвлөсөн" | "Баталгаажсан" | "Цуцлагдсан";

type DepartmentMeetingItem = {
  id: number;
  meeting_id: string;
  title: string;
  status: MeetingStatus;
  organizer: string;
  organizer_id: number;
  date: string;
  location: string;
  description?: string;
  department: string;
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

export default function DepartmentHeadDepartmentMeetingsPage() {
  const [items, setItems] = useState<DepartmentMeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed'>('all');
  const [transcripts, setTranscripts] = useState<{[key: string]: string}>({});
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    status: "Төлөвлөсөн" as MeetingStatus,
    date: "",
    location: "",
    description: "",
    department: "Хяналт шалгалтын хэлтэс",
  });
  const userId = 2; // TODO: Get from auth context (Department Head user ID)

  // Fetch department meetings
  useEffect(() => {
    fetchDepartmentMeetings();
  }, []);

  const fetchDepartmentMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/department-meetings?department=Хяналт шалгалтын хэлтэс`);
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.meetings || []);
      } else {
        // Mock data for now
        const mockData: DepartmentMeetingItem[] = [
          {
            id: 1,
            meeting_id: "DM-001",
            title: "Хэлтсийн сарын уулзалт",
            status: "Төлөвлөсөн",
            organizer: "Албаны дарга Бат",
            organizer_id: 2,
            date: "2026-05-15 14:00",
            location: "Хэлтсийн танхим 301",
            description: "Сарын гүйцэтгэл, төлөвлөлт, илэрсэн асуудлуудыг хэлэлцэх.",
            department: "Хяналт шалгалтын хэлтэс",
          },
          {
            id: 2,
            meeting_id: "DM-002",
            title: "Багийн ахлагчдын уулзалт",
            status: "Баталгаажсан",
            organizer: "Албаны дарга Бат",
            organizer_id: 2,
            date: "2026-05-10 10:00",
            location: "Онлайн (Zoom)",
            description: "Багийн ахлагчдын тайлан, гүйцэтгэлийн талаар хэлэлцэх.",
            department: "Хяналт шалгалтын хэлтэс",
          },
          {
            id: 3,
            meeting_id: "DM-003",
            title: "Шинэ төсөлөгчийн уулзалт",
            status: "Цуцлагдсан",
            organizer: "Албаны дарга Бат",
            organizer_id: 2,
            date: "2026-05-08 16:00",
            location: "Хэлтсийн танхим 301",
            description: "Шинээр төсөгдсөн ажилтантай танилцах, ажлын орчин танилцуулах.",
            department: "Хяналт шалгалтын хэлтэс",
          },
        ];
        setItems(mockData);
      }
    } catch (error) {
      console.error('Error fetching department meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const response = await fetch('/api/department-meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMeeting,
          organizer_id: userId,
          organizer: "Албаны дарга Бат",
        }),
      });

      if (response.ok) {
        const createdMeeting = await response.json();
        setItems(prev => [createdMeeting, ...prev]);
        setNewMeeting({ title: "", status: "Төлөвлөсөн", date: "", location: "", description: "", department: "Хяналт шалгалтын хэлтэс" });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating department meeting:', error);
    }
  };

  const filteredItems = activeTab === 'confirmed' 
    ? items.filter(item => item.status === 'Баталгаажсан')
    : items;

  return (
    <DepartmentHeadShell
      currentPath="/department_head/department_meetings"
      kicker="Department Meetings"
      title="Хэлтс доторх хурал, уулзалт"
      description="Зөвхөн таны хэлтс доторх багийн хурал, уулзалтын хуваарь. Director 1, Director 2, Admin хэрэглэгчид оролцохгүй."
      stats={[
        { label: "Энэ сар", value: "3" },
        { label: "Баталгаажсан", value: "1" },
        { label: "Төлөвлөсөн", value: "1" },
        { label: "Цуцлагдсан", value: "1" },
      ]}
      action={null}
    >
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === 'all'
              ? 'bg-slate-950 text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Бүгд
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('confirmed')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === 'confirmed'
              ? 'bg-slate-950 text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Баталгаажсан
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-2xl mb-3 animate-spin">⏳</p>
          <p>Ачаалж байна...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[28px] border border-stone-300 bg-white shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.meeting_id}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хэзээ</p>
                  <p className="mt-1 font-medium text-slate-950">{item.date}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Байршил</p>
                  <p className="mt-1 font-medium text-slate-950">{item.location}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Зохион байгуулагч</p>
                  <p className="mt-1 font-medium text-slate-950">{item.organizer}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {item.department}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

          </DepartmentHeadShell>
  );
}
