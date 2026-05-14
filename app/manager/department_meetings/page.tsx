"use client";

import { useState, useEffect } from "react";
import { ManagerShell } from "../_components/manager-shell";
import { VoiceRecorder } from "@/app/_components/voice-recorder";

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
  manager_reaction?: "approved" | "rejected" | "noted";
  manager_comment?: string;
  manager_reaction_at?: string;
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

function getReactionClasses(reaction?: string) {
  if (reaction === "approved") return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (reaction === "rejected") return "bg-red-50 border-red-200 text-red-700";
  if (reaction === "noted") return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-slate-50 border-slate-200 text-slate-600";
}

export default function ManagerDepartmentMeetingsPage() {
  const [items, setItems] = useState<DepartmentMeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    status: "Төлөвлөсөн" as MeetingStatus,
    date: "",
    location: "",
    description: "",
    department: "Хяналт шалгалтын хэлтэс",
  });
  const userId = 1; // TODO: Get from auth context (Manager user ID)

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
            title: "Бүх хэлтсийн сарын уулзалт",
            status: "Төлөвлөсөн",
            organizer: "Албаны дарга Бат",
            organizer_id: 2,
            date: "2026-05-15 14:00",
            location: "Хэлтсийн танхим 301",
            description: "Бүх хэлтсийн сарын гүйцэтгэлийн тайлан, төлөвлөлт, илэрсэн асуудлуудыг хэлэлцэх.",
            department: "Хяналт шалгалтын хэлтэс",
            manager_reaction: "approved",
            manager_comment: "Сарын тайлан бэлтгэж, илгээхэд бэлэн.",
            manager_reaction_at: "2026-05-14 10:30",
          },
          {
            id: 2,
            meeting_id: "DM-002",
            title: "Хяналт шалгалтын багийн уулзалт",
            status: "Баталгаажсан",
            organizer: "Албаны дарга Бат",
            organizer_id: 2,
            date: "2026-05-10 10:00",
            location: "Онлайн (Zoom)",
            description: "Хяналт шалгалтын багийн гишүүдийн тайлан, гүйцэтгэл хэлэлцэх.",
            department: "Хяналт шалгалтын хэлтэс",
            manager_reaction: "noted",
            manager_comment: "Тайланг хүлээн авлаа, дараагийн шатанд шилжүүлнэ.",
            manager_reaction_at: "2026-05-09 16:45",
          },
          {
            id: 3,
            meeting_id: "DM-003",
            title: "Шинэ хяналтын төхөөрөмжийн танилцуулга",
            status: "Төлөвлөсөн",
            organizer: "Багийн ахлагч Номин",
            organizer_id: 3,
            date: "2026-05-08 16:00",
            location: "Хэлтсийн танхим 301",
            description: "Шинээр нэвтэрсэн хяналтын төхөөрөмжийн талаар багт танилцуулах.",
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
          organizer: "Менежер Тэмүүжин",
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

  const handleManagerReaction = async (meetingId: number, reaction: "approved" | "rejected" | "noted", comment?: string) => {
    try {
      const response = await fetch(`/api/department-meetings/${meetingId}/react`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager_reaction: reaction,
          manager_comment: comment,
          manager_id: userId,
        }),
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item.id === meetingId 
            ? { 
                ...item, 
                manager_reaction: reaction, 
                manager_comment: comment,
                manager_reaction_at: new Date().toISOString(),
              } 
            : item
        ));
      }
    } catch (error) {
      console.error('Error updating manager reaction:', error);
    }
  };

  const filteredItems = activeTab === 'confirmed' 
    ? items.filter(item => item.status === 'Баталгаажсан')
    : activeTab === 'pending'
    ? items.filter(item => !item.manager_reaction)
    : items;

  return (
    <ManagerShell
      currentPath="/manager/department_meetings"
      kicker="Department Meetings"
      title="Хэлтс доторх хурал, уулзалт"
      description="Зөвхөн таны хэлтс доторх багийн хурал, уулзалтын хуваарь. Director 1, Director 2, Admin хэрэглэгчид оролцохгүй."
      stats={[
        { label: "Энэ сар", value: "3" },
        { label: "Баталгаажсан", value: "1" },
        { label: "Хүлээгдэж байга", value: "1" },
        { label: "Төлөвлөсөн", value: "1" },
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
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === 'pending'
              ? 'bg-slate-950 text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Хүлээгдэж байга
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
                <div className="flex flex-col gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  {item.manager_reaction && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${getReactionClasses(
                        item.manager_reaction
                      )}`}
                    >
                      {item.manager_reaction === "approved" ? "Зөвшөөрсөн" : 
                       item.manager_reaction === "rejected" ? "Цуцлагдсан" : "Тэмдэглэв"}
                    </span>
                  )}
                </div>
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

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {item.department}
                  </span>
                  <VoiceRecorder meetingId={item.meeting_id} userId={userId} />
                </div>
                {!item.manager_reaction && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManagerReaction(item.id, "approved", "Баталгаажлаа, илгээхэд бэлэн.");
                      }}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Зөвшөөрөх
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManagerReaction(item.id, "rejected", "Цуцлав, дахин бэлтгэж илгээнэ үү.");
                      }}
                      className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                    >
                      Цуцлах
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManagerReaction(item.id, "noted", "Тэмдэглэв, дараагийн шатанд шилжүүлнэ.");
                      }}
                      className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-700"
                    >
                      Тэмдэглэх
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

          </ManagerShell>
  );
}
