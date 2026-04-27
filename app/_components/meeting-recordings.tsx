"use client";

import { useState, useEffect } from "react";
import { getMeetingRecordings, deleteMeetingRecording } from "@/app/_lib/upload-recording";

interface Recording {
  id: number;
  meeting_id: string;
  user_id: number;
  file_path: string;
  public_url: string;
  file_size: number;
  duration_seconds: number;
  created_at: string;
}

interface MeetingRecordingsProps {
  meetingId: string;
  refreshTrigger?: number;
}

export function MeetingRecordings({ meetingId, refreshTrigger = 0 }: MeetingRecordingsProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadRecordings();
  }, [meetingId, refreshTrigger]);

  const loadRecordings = async () => {
    setLoading(true);
    const data = await getMeetingRecordings(meetingId);
    setRecordings(data);
    setLoading(false);
  };

  const handleDelete = async (id: number, filePath: string) => {
    if (!confirm("Энэ бичлэгийг устгах уу?")) return;
    
    setDeletingId(id);
    await deleteMeetingRecording(filePath, id);
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("mn-MN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500 text-center">Бичлэгүүд ачаалж байна...</p>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-400 text-center">Одоогоор бичлэг байхгүй</p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="font-semibold text-slate-950 mb-4">
        Хадгалсан бичлэгүүд ({recordings.length})
      </h4>
      <div className="space-y-3">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-emerald-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                Бичлэг #{recording.id}
              </p>
              <p className="text-xs text-slate-500">
                {formatDuration(recording.duration_seconds)} • {formatFileSize(recording.file_size)} • {formatDate(recording.created_at)}
              </p>
            </div>
            <audio
              src={recording.public_url}
              controls
              className="h-8 w-32"
            />
            <button
              onClick={() => handleDelete(recording.id, recording.file_path)}
              disabled={deletingId === recording.id}
              className="p-2 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition disabled:opacity-50"
            >
              {deletingId === recording.id ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
