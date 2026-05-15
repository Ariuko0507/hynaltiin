"use client";

import { useState, useEffect, useMemo } from "react";
import { ManagerShell } from "../_components/manager-shell";
import { getUnreadNotificationCount } from "@/app/_lib/notifications";
import { getMeetingRecordings, updateRecordingTranscription } from "@/app/_lib/upload-recording";
import { VoiceRecorder } from "@/app/_components/voice-recorder";

type TaskStatus = "Эхэлсэн" | "Зассан" | "Эсхийг" | "Дууссан";
type TaskFilter = "meetings";

type TaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  due: string;
  owner: string;
  assignedBy: string;
  description: string;
};

type MeetingWithRecording = {
  id: string;
  meeting_id: string;
  title: string;
  recording_count: number;
  transcripts: string[];
  type?: 'meeting' | 'department';
};

type MeetingApiBasic = {
  id: number;
  meeting_id?: string | null;
  meeting_code?: string | null;
  title: string;
};

type RecordingListItem = {
  id: number;
  meeting_id?: string | null;
  transcription?: string | null;
  transcript?: string | null;
};

type TaskTemplateRow = {
  id: string;
  task: string;
  due: string;
  owner: string;
};

type TaskTemplateField = "task" | "due" | "owner";

type DocumentHeaderDraft = {
  approvalLabel: string;
  approvalOrgLine1: string;
  approvalOrgLine2: string;
  approverName: string;
  approvalDate: string;
  mainTitle: string;
  documentNumber: string;
};

type DocumentHeaderField = keyof DocumentHeaderDraft;

type RecipientUser = {
  id: number;
  name: string;
  position: string;
};

const managerTasks: TaskItem[] = [
  {
    id: "M-301",
    title: "Багийн хуваарь шинэчлэх",
    status: "Эхэлсэн",
    due: "2026-04-19",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Директор Энх",
    description: "Багийн ажилтнуудын хуваарийг шинэчилж, оновчтой болгох.",
  },
  {
    id: "M-302",
    title: "Төсөл бүрийн тайлан боловсруулах",
    status: "Зассан",
    due: "2026-04-22",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Директор Энх",
    description: "Бүх төслийн тайланг нэгтгэн, дүгнэлт гаргах.",
  },
  {
    id: "M-303",
    title: "Ресурс хуваарилалт хянах",
    status: "Эсхийг",
    due: "2026-04-20",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Санхүүгийн алба",
    description: "Багийн нөөцийн хуваарилалтыг хянаж, зохицуулах.",
  },
  {
    id: "M-304",
    title: "Ажилтнуудын гүйцэтгэлийг үнэлэх",
    status: "Дууссан",
    due: "2026-04-25",
    owner: "Менежер Тэмүүжин",
    assignedBy: "Хүний нөөц",
    description: "Багийн гишүүдийн сарын гүйцэтгэлийг үнэлж, тайлан гаргах.",
  },
];

const filterLabels: Record<TaskFilter, string> = {
  meetings: "Дуу бичлэгтэй хурал",
};

function getStatusClasses(status: TaskStatus) {
  if (status === "Дууссан") return "bg-emerald-100 text-emerald-700";
  if (status === "Зассан") return "bg-sky-100 text-sky-700";
  if (status === "Эсхийг") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

function buildTaskTemplateRows(meeting: MeetingWithRecording): TaskTemplateRow[] {
  return [
    {
      id: "1",
      task: `${meeting.title} хурлын тэмдэглэлийг баталгаажуулж, оролцогчдод түгээх`,
      due: "III/06",
      owner: "Хурал хариуцсан ахлах мэргэжилтэн",
    },
    {
      id: "2",
      task: "Хурлаар өгөгдсөн үүрэг даалгаврын хэрэгжилтийн төлөвлөгөө гаргах",
      due: "III/08",
      owner: "Зохион байгуулалт, төлөвлөлтийн мэргэжилтэн",
    },
    {
      id: "3",
      task: "Хариуцсан нэгжүүдээс явцын мэдээлэл нэгтгэж тайлан бэлтгэх",
      due: "III/12",
      owner: "Хяналт, шинжилгээний ажилтан",
    },
  ];
}

function extractTranscripts(recordings: RecordingListItem[]): string[] {
  return recordings
    .map((recording) => (recording.transcription ?? recording.transcript ?? "").trim())
    .filter((text) => text.length > 0);
}

function resolveMeetingIdentifier(meeting: MeetingApiBasic): string {
  const meetingId = typeof meeting.meeting_id === "string" ? meeting.meeting_id.trim() : "";
  if (meetingId) return meetingId;
  const meetingCode = typeof meeting.meeting_code === "string" ? meeting.meeting_code.trim() : "";
  if (meetingCode) return meetingCode;
  return `MTG-${meeting.id}`;
}

function buildDocumentHeaderDraft(meeting: MeetingWithRecording): DocumentHeaderDraft {
  return {
    approvalLabel: "БАТЛАВ",
    approvalOrgLine1: "НИЙСЛЭЛИЙН ХЯНАЛТ ШАЛГАЛТЫН ГАЗРЫН",
    approvalOrgLine2: "ЗАХИРГАА, САНХҮҮГИЙН ХЭЛТСИЙН ДАРГА",
    approverName: "Б.БАЙГАЛМАА",
    approvalDate: "2026 оны 03 дугаар сарын 03",
    mainTitle: `${meeting.title} ХУРЛААС ӨГСӨН ҮҮРЭГ ДААЛГАВАР`,
    documentNumber: "Дугаар 04",
  };
}

function upsertUniqueMeeting(
  current: MeetingWithRecording[],
  incoming: MeetingWithRecording
): MeetingWithRecording[] {
  const index = current.findIndex((item) => item.meeting_id === incoming.meeting_id);
  if (index === -1) {
    return [...current, incoming];
  }

  const existing = current[index];
  const merged: MeetingWithRecording = {
    ...existing,
    ...incoming,
    type: existing.type === "department" ? existing.type : incoming.type ?? existing.type,
    recording_count: Math.max(existing.recording_count, incoming.recording_count),
    transcripts: existing.transcripts.length >= incoming.transcripts.length
      ? existing.transcripts
      : incoming.transcripts,
  };

  const next = [...current];
  next[index] = merged;
  return next;
}

function TaskDetailCard({ task }: { task: TaskItem }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{task.id}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{task.title}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(task.status)}`}>
          {task.status}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хугацаа</p>
          <p className="mt-2 font-medium text-slate-950">{task.due}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Хариуцагч</p>
          <p className="mt-2 font-medium text-slate-950">{task.owner}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Даалгасан</p>
          <p className="mt-2 font-medium text-slate-950">{task.assignedBy}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
          <p className="text-xs text-slate-400 uppercase tracking-[0.24em]">Тайлбар</p>
          <p className="mt-2 font-medium leading-7 text-slate-950">{task.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function ManagerTasksPage() {
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = 2; // TODO: Get from auth context
  const [selectedId, setSelectedId] = useState(managerTasks[0].id);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("meetings");
  const [activeMeetingFilter, setActiveMeetingFilter] = useState<'all' | 'regular' | 'department'>('all');
  const [meetingsWithRecordings, setMeetingsWithRecordings] = useState<MeetingWithRecording[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithRecording | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'voice' | 'transcript'>('details');
  const [expandedDepartmentMeetingId, setExpandedDepartmentMeetingId] = useState<string | null>(null);
  const [liveTranscriptsByMeetingId, setLiveTranscriptsByMeetingId] = useState<Record<string, string[]>>({});
  const [loadingInlineTranscriptMeetingId, setLoadingInlineTranscriptMeetingId] = useState<string | null>(null);
  const [recordingsByMeetingId, setRecordingsByMeetingId] = useState<Record<string, RecordingListItem[]>>({});
  const [editedTranscripts, setEditedTranscripts] = useState<Record<number, string>>({});
  const [savingTranscriptId, setSavingTranscriptId] = useState<number | null>(null);
  const [transcriptMessage, setTranscriptMessage] = useState("");
  const [taskTemplateDraftsByMeetingId, setTaskTemplateDraftsByMeetingId] = useState<Record<string, TaskTemplateRow[]>>({});
  const [documentHeaderDraftsByMeetingId, setDocumentHeaderDraftsByMeetingId] = useState<Record<string, DocumentHeaderDraft>>({});
  const [recipientUsers, setRecipientUsers] = useState<RecipientUser[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  const [sendingDispatch, setSendingDispatch] = useState(false);
  const [dispatchMessage, setDispatchMessage] = useState("");

  // Fetch meetings with voice recordings
  useEffect(() => {
    fetchMeetingsWithRecordings();
  }, []);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await fetch(`/api/meeting-task-dispatch?actor_id=${userId}`);
        if (!response.ok) return;
        const data = await response.json();
        const users = (data.users || []) as RecipientUser[];
        setRecipientUsers(users);
        if (users.length > 0) {
          setSelectedRecipientId(users[0].id);
        }
      } catch (error) {
        console.error("Error fetching recipients:", error);
      }
    };

    fetchRecipients();
  }, [userId]);

  const applyMeetingRecordingUpdate = (meetingId: string, recordings: RecordingListItem[]) => {
    const transcripts = extractTranscripts(recordings);
    setRecordingsByMeetingId((current) => ({ ...current, [meetingId]: recordings }));
    setEditedTranscripts((current) => {
      const next = { ...current };
      recordings.forEach((recording) => {
        if (typeof recording.transcription === "string") {
          next[recording.id] = recording.transcription;
        } else if (!(recording.id in next)) {
          next[recording.id] = "";
        }
      });
      return next;
    });
    setLiveTranscriptsByMeetingId((current) => ({ ...current, [meetingId]: transcripts }));
    setMeetingsWithRecordings((current) =>
      current.map((meeting) =>
        meeting.meeting_id === meetingId
          ? {
              ...meeting,
              recording_count: recordings.length,
              transcripts,
            }
          : meeting
      )
    );
    setSelectedMeeting((current) =>
      current && current.meeting_id === meetingId
        ? {
            ...current,
            recording_count: recordings.length,
            transcripts,
          }
        : current
    );
  };

  const refreshMeetingRecordingData = async (meetingId: string) => {
    const recordings = (await getMeetingRecordings(meetingId, userId)) as RecordingListItem[];
    applyMeetingRecordingUpdate(meetingId, recordings);
    return recordings;
  };

  const handleTranscriptSave = async (meetingId: string, recordId: number) => {
    const text = (editedTranscripts[recordId] ?? "").trim();
    setSavingTranscriptId(recordId);
    setTranscriptMessage("");
    try {
      const result = await updateRecordingTranscription(recordId, text);
      if (!result.success) {
        setTranscriptMessage("Текст хадгалахад алдаа гарлаа.");
        return;
      }
      await refreshMeetingRecordingData(meetingId);
      setTranscriptMessage("Текст амжилттай хадгалагдлаа.");
    } finally {
      setSavingTranscriptId(null);
      setTimeout(() => setTranscriptMessage(""), 2000);
    }
  };

  const getTaskTemplateRows = (meeting: MeetingWithRecording) => {
    return taskTemplateDraftsByMeetingId[meeting.meeting_id] ?? buildTaskTemplateRows(meeting);
  };

  const ensureTaskTemplateDraft = (meeting: MeetingWithRecording) => {
    setTaskTemplateDraftsByMeetingId((current) => {
      if (current[meeting.meeting_id]) {
        return current;
      }
      return {
        ...current,
        [meeting.meeting_id]: buildTaskTemplateRows(meeting),
      };
    });
  };

  const handleTaskTemplateChange = (
    meetingId: string,
    rowId: string,
    field: TaskTemplateField,
    value: string
  ) => {
    setTaskTemplateDraftsByMeetingId((current) => {
      const rows = current[meetingId] ?? [];
      return {
        ...current,
        [meetingId]: rows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                [field]: value,
              }
            : row
        ),
      };
    });
  };

  const getDocumentHeaderDraft = (meeting: MeetingWithRecording) => {
    return documentHeaderDraftsByMeetingId[meeting.meeting_id] ?? buildDocumentHeaderDraft(meeting);
  };

  const ensureDocumentHeaderDraft = (meeting: MeetingWithRecording) => {
    setDocumentHeaderDraftsByMeetingId((current) => {
      if (current[meeting.meeting_id]) return current;
      return {
        ...current,
        [meeting.meeting_id]: buildDocumentHeaderDraft(meeting),
      };
    });
  };

  const handleDocumentHeaderChange = (
    meeting: MeetingWithRecording,
    field: DocumentHeaderField,
    value: string
  ) => {
    setDocumentHeaderDraftsByMeetingId((current) => {
      const base = current[meeting.meeting_id] ?? buildDocumentHeaderDraft(meeting);
      return {
        ...current,
        [meeting.meeting_id]: {
          ...base,
          [field]: value,
        },
      };
    });
  };

  const handleDispatchMeetingTaskTable = async (meeting: MeetingWithRecording) => {
    if (!selectedRecipientId) {
      setDispatchMessage("Хүлээн авагч сонгоно уу.");
      return;
    }

    const rows = getTaskTemplateRows(meeting);
    const header = getDocumentHeaderDraft(meeting);

    setSendingDispatch(true);
    setDispatchMessage("");
    try {
      const response = await fetch("/api/meeting-task-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor_id: userId,
          recipient_id: selectedRecipientId,
          meeting_id: meeting.meeting_id,
          meeting_title: meeting.title,
          header,
          rows,
        }),
      });

      if (!response.ok) {
        setDispatchMessage("Хүснэгт илгээхэд алдаа гарлаа.");
        return;
      }

      const recipient = recipientUsers.find((user) => user.id === selectedRecipientId);
      setDispatchMessage(`Хүснэгтийг ${recipient?.name ?? "сонгосон хэрэглэгч"} рүү илгээлээ.`);
    } catch (error) {
      console.error("Dispatch meeting task table error:", error);
      setDispatchMessage("Хүснэгт илгээхэд алдаа гарлаа.");
    } finally {
      setSendingDispatch(false);
      setTimeout(() => setDispatchMessage(""), 2500);
    }
  };

  const fetchMeetingsWithRecordings = async () => {
    try {
      const meetingsWithRecs: MeetingWithRecording[] = [];

      // Fetch regular meetings
      const response = await fetch(`/api/meetings?userId=${userId}&userRole=manager`);
      const data = await response.json();
      if (data.meetings) {
        const meetings = data.meetings as MeetingApiBasic[];

        // Check each meeting for recordings
        for (const meeting of meetings) {
          const meetingIdentifier = resolveMeetingIdentifier(meeting);
          const recordings = (await getMeetingRecordings(meetingIdentifier, userId)) as RecordingListItem[];
          if (recordings.length > 0) {
            const transcripts = extractTranscripts(recordings);
            const incoming: MeetingWithRecording = {
              id: meeting.id.toString(),
              meeting_id: meetingIdentifier,
              title: meeting.title,
              recording_count: recordings.length,
              transcripts,
              type: 'meeting',
            };
            const deduped = upsertUniqueMeeting(meetingsWithRecs, incoming);
            meetingsWithRecs.length = 0;
            meetingsWithRecs.push(...deduped);
          }
        }
      }

      // Fetch department meetings
      const deptResponse = await fetch(`/api/department-meetings?department=Хяналт шалгалтын хэлтэс`);
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        if (deptData.meetings) {
          const deptMeetings = deptData.meetings as MeetingApiBasic[];

          // Check each department meeting for recordings
          for (const meeting of deptMeetings) {
            const meetingIdentifier = resolveMeetingIdentifier(meeting);
            const recordings = (await getMeetingRecordings(meetingIdentifier, userId)) as RecordingListItem[];
            if (recordings.length > 0) {
              const transcripts = extractTranscripts(recordings);
              const incoming: MeetingWithRecording = {
                id: meeting.id.toString(),
                meeting_id: meetingIdentifier,
                title: meeting.title,
                recording_count: recordings.length,
                transcripts,
                type: 'department',
              };
              const deduped = upsertUniqueMeeting(meetingsWithRecs, incoming);
              meetingsWithRecs.length = 0;
              meetingsWithRecs.push(...deduped);
            }
          }
        }
      }

      setMeetingsWithRecordings(meetingsWithRecs);
    } catch (error) {
      console.error('Error fetching meetings with recordings:', error);
    }
  };

  const filteredTasks = useMemo(() => {
    return managerTasks;
  }, []);

  const filteredMeetings = useMemo(() => {
    if (activeMeetingFilter === 'regular') {
      return meetingsWithRecordings.filter(meeting => meeting.type === 'meeting');
    }
    if (activeMeetingFilter === 'department') {
      return meetingsWithRecordings.filter(meeting => meeting.type === 'department');
    }
    return meetingsWithRecordings;
  }, [activeMeetingFilter, meetingsWithRecordings]);

  useEffect(() => {
    if (!selectedMeeting && filteredMeetings.length > 0) {
      setSelectedMeeting(filteredMeetings[0]);
      setActiveDetailTab("details");
    }
  }, [filteredMeetings, selectedMeeting]);

  const selectedItem = filteredTasks.find((item) => item.id === selectedId) ?? filteredTasks[0];

  return (
    <ManagerShell
      currentPath="/manager/tasks"
      kicker="Tasks"
      title="Менежерийн даалгаврууд"
      description="Багийн даалгавруудыг хянаж, статусыг шинэчилж, ажилтнуудад удирдамж өгнө."
      fullWidth
      stats={[
        { label: "Нийт даалгавар", value: "4" },
        { label: "Идэвхтэй", value: "2" },
        { label: "Хүлээгдэж буй", value: "1" },
      ]}
      noteText="Шүүлтүүр ашиглаад идэвхтэй болон хүлээгдэж буй даалгавруудаа түрүүлж хараарай."
      notifications={notificationCount}
      userId={userId}
    >
      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Жагсаалт</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{filteredMeetings.length} хурал</h2>

          <div className="mt-6 space-y-3">
            {filteredMeetings.map((meeting) => {
              const meetingKey = `${meeting.type ?? "meeting"}-${meeting.id}-${meeting.meeting_id}`;
              const selectedMeetingKey = selectedMeeting
                ? `${selectedMeeting.type ?? "meeting"}-${selectedMeeting.id}-${selectedMeeting.meeting_id}`
                : null;
              const isSelected = selectedMeetingKey === meetingKey;
              const isDepartmentMeeting = meeting.type === "department";
              const isExpanded = expandedDepartmentMeetingId === meetingKey;
              const inlineTranscripts = liveTranscriptsByMeetingId[meeting.meeting_id] ?? meeting.transcripts;

              return (
                <div
                  key={meetingKey}
                  className={`overflow-hidden rounded-[24px] border transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                      : "border-slate-200 bg-white text-slate-950 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      setSelectedMeeting(meeting);
                      setActiveDetailTab('details');
                      ensureTaskTemplateDraft(meeting);
                      ensureDocumentHeaderDraft(meeting);
                      if (isDepartmentMeeting) {
                        const isOpening = expandedDepartmentMeetingId !== meetingKey;
                        setExpandedDepartmentMeetingId((current) => (current === meetingKey ? null : meetingKey));
                        if (isOpening) {
                          setLoadingInlineTranscriptMeetingId(meetingKey);
                          try {
                            await refreshMeetingRecordingData(meeting.meeting_id);
                          } finally {
                            setLoadingInlineTranscriptMeetingId(null);
                          }
                        }
                      } else {
                        setExpandedDepartmentMeetingId(null);
                        await refreshMeetingRecordingData(meeting.meeting_id);
                      }
                    }}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs uppercase tracking-[0.24em] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                            {meeting.meeting_id}
                          </p>
                          {isDepartmentMeeting && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"}`}>
                              Хэлтсийн
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold leading-snug">{meeting.title}</h3>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                        isSelected ? "bg-white/15 text-white" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        🎤 {meeting.recording_count}
                      </span>
                    </div>

                    {inlineTranscripts.length > 0 && (
                      <div className={`mt-3 p-2 rounded text-xs ${isSelected ? "bg-white/10 text-slate-200" : "bg-slate-50 text-slate-600"}`}>
                        {inlineTranscripts[0].substring(0, 80)}...
                      </div>
                    )}
                  </button>

                  {isDepartmentMeeting && isExpanded && (
                    <div className={`border-t px-4 py-3 ${isSelected ? "border-white/20 bg-white/10 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                      <p className={`text-xs uppercase tracking-[0.24em] ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                        Transcript Tab
                      </p>
                      {loadingInlineTranscriptMeetingId === meetingKey ? (
                        <p className="mt-2 text-xs">Текст ачааллаж байна...</p>
                      ) : inlineTranscripts.length > 0 ? (
                        <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">
                          {inlineTranscripts.map((transcript, index) => (
                            <div key={`${meeting.id}-transcript-${index}`} className={`rounded-xl p-3 text-xs leading-6 ${isSelected ? "bg-white/10" : "bg-white"}`}>
                              {transcript}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs">Текст хөрвүүлэлт байхгүй байна.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </article>
        </div>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Дэлгэрэнгүй</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {selectedMeeting?.title || "Сонгоно уу"}
              </h2>
            </div>
            {selectedMeeting && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                🎤 {selectedMeeting.recording_count} бичлэг
              </span>
            )}
          </div>

          <div className="mt-6">
            {selectedMeeting ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                {activeDetailTab === 'details' ? (
                  <div className="space-y-4">
                    <div>
                      <div className="mt-2 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                        <div className="px-6 pb-3 pt-5">
                          <div className="flex justify-end">
                            <div className="w-full max-w-[360px] text-[14px] leading-6 text-slate-900">
                              <input
                                value={getDocumentHeaderDraft(selectedMeeting).approvalLabel}
                                onChange={(event) => handleDocumentHeaderChange(selectedMeeting, "approvalLabel", event.target.value)}
                                className="w-full border-none bg-transparent text-right text-xl font-semibold outline-none"
                              />
                              <textarea
                                value={`${getDocumentHeaderDraft(selectedMeeting).approvalOrgLine1}\n${getDocumentHeaderDraft(selectedMeeting).approvalOrgLine2}`}
                                onChange={(event) => {
                                  const [line1 = "", line2 = ""] = event.target.value.split("\n");
                                  handleDocumentHeaderChange(selectedMeeting, "approvalOrgLine1", line1);
                                  handleDocumentHeaderChange(selectedMeeting, "approvalOrgLine2", line2);
                                }}
                                rows={2}
                                className="mt-2 w-full resize-none border-none bg-transparent text-right leading-6 outline-none"
                              />
                              <input
                                value={getDocumentHeaderDraft(selectedMeeting).approverName}
                                onChange={(event) => handleDocumentHeaderChange(selectedMeeting, "approverName", event.target.value)}
                                className="mt-1 w-full border-none bg-transparent text-right text-lg font-semibold outline-none"
                              />
                              <input
                                value={getDocumentHeaderDraft(selectedMeeting).approvalDate}
                                onChange={(event) => handleDocumentHeaderChange(selectedMeeting, "approvalDate", event.target.value)}
                                className="mt-2 w-full border-none bg-transparent text-right outline-none"
                              />
                            </div>
                          </div>

                          <div className="mt-6 text-center text-slate-900">
                            <textarea
                              value={getDocumentHeaderDraft(selectedMeeting).mainTitle}
                              onChange={(event) => handleDocumentHeaderChange(selectedMeeting, "mainTitle", event.target.value)}
                              rows={3}
                              className="w-full resize-none border-none bg-transparent text-center text-[31px] font-semibold uppercase leading-tight outline-none"
                            />
                            <input
                              value={getDocumentHeaderDraft(selectedMeeting).documentNumber}
                              onChange={(event) => handleDocumentHeaderChange(selectedMeeting, "documentNumber", event.target.value)}
                              className="mt-3 w-full border-none bg-transparent text-center text-3xl outline-none"
                            />
                          </div>
                        </div>

                        <div className="max-h-[430px] overflow-auto px-4 pb-4">
                          <table className="min-w-full border-collapse text-sm text-slate-900">
                            <thead className="sticky top-0 z-10 bg-white">
                              <tr>
                                <th className="border border-slate-300 px-3 py-3 text-center font-semibold">Д/д</th>
                                <th className="border border-slate-300 px-4 py-3 text-center font-semibold">Өгөгдсөн үүрэг даалгавар</th>
                                <th className="border border-slate-300 px-4 py-3 text-center font-semibold">Хугацаа</th>
                                <th className="border border-slate-300 px-4 py-3 text-center font-semibold">Хариуцах албан хаагч</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getTaskTemplateRows(selectedMeeting).map((row) => (
                                <tr key={row.id} className="align-top">
                                  <td className="border border-slate-300 px-3 py-4 text-center font-medium">{row.id}</td>
                                  <td className="border border-slate-300 px-3 py-3">
                                    <textarea
                                      value={row.task}
                                      onChange={(event) =>
                                        handleTaskTemplateChange(selectedMeeting.meeting_id, row.id, "task", event.target.value)
                                      }
                                      rows={3}
                                      className="w-full resize-y rounded border border-slate-200 px-2 py-1 text-sm leading-7 outline-none focus:border-slate-400"
                                    />
                                  </td>
                                  <td className="border border-slate-300 px-3 py-3 text-center">
                                    <input
                                      type="text"
                                      value={row.due}
                                      onChange={(event) =>
                                        handleTaskTemplateChange(selectedMeeting.meeting_id, row.id, "due", event.target.value)
                                      }
                                      className="w-full rounded border border-slate-200 px-2 py-1 text-center text-sm font-medium outline-none focus:border-slate-400"
                                    />
                                  </td>
                                  <td className="border border-slate-300 px-3 py-3">
                                    <textarea
                                      value={row.owner}
                                      onChange={(event) =>
                                        handleTaskTemplateChange(selectedMeeting.meeting_id, row.id, "owner", event.target.value)
                                      }
                                      rows={3}
                                      className="w-full resize-y rounded border border-slate-200 px-2 py-1 text-sm leading-7 outline-none focus:border-slate-400"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="border-t border-slate-200 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Илгээх</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <select
                              value={selectedRecipientId ?? ""}
                              onChange={(event) => setSelectedRecipientId(Number(event.target.value))}
                              className="min-w-[260px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                            >
                              {recipientUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.position})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDispatchMeetingTaskTable(selectedMeeting)}
                              disabled={sendingDispatch || !selectedRecipientId}
                              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {sendingDispatch ? "Илгээж байна..." : "Хүснэгт илгээх"}
                            </button>
                          </div>
                          {dispatchMessage ? (
                            <p className="mt-2 text-sm text-emerald-700">{dispatchMessage}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeDetailTab === 'voice' ? (
                  <div className="rounded-2xl bg-slate-50 p-6">
                    <VoiceRecorder
                      meetingId={selectedMeeting.meeting_id}
                      userId={userId}
                      onRecordingSaved={() => {
                        refreshMeetingRecordingData(selectedMeeting.meeting_id);
                      }}
                      maxDuration={600}
                    />
                  </div>
                ) : (
                  <>
                    {recordingsByMeetingId[selectedMeeting.meeting_id]?.length ? (
                      <div className="space-y-3">
                        {recordingsByMeetingId[selectedMeeting.meeting_id].map((recording, index) => (
                          <div key={recording.id} className="rounded-2xl bg-slate-50 p-4">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Бичлэг {index + 1}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleTranscriptSave(selectedMeeting.meeting_id, recording.id)}
                                disabled={savingTranscriptId === recording.id}
                                className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                              >
                                {savingTranscriptId === recording.id ? "Хадгалж байна..." : "Хадгалах"}
                              </button>
                            </div>
                            <textarea
                              value={editedTranscripts[recording.id] ?? ""}
                              onChange={(event) =>
                                setEditedTranscripts((current) => ({
                                  ...current,
                                  [recording.id]: event.target.value,
                                }))
                              }
                              rows={7}
                              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-slate-400"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-600">
                        <p>Текст хөрвүүлэлт байхгүй байна</p>
                      </div>
                    )}
                    {transcriptMessage ? (
                      <p className="mt-3 text-sm text-emerald-700">{transcriptMessage}</p>
                    ) : null}
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-6 py-8 text-center text-slate-600">
                <p>Жагсаалтаас хурал сонгоно уу</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </ManagerShell>
  );
}
