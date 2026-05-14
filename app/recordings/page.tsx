"use client";

import { useState, useEffect } from "react";
import { DepartmentHeadShell } from "../_components/department-head-shell";

interface Transcript {
  id: string;
  meeting_id: string;
  transcript: string;
  user_id: number | null;
  audio_file_path: string | null;
  created_at: string;
}

export default function RecordingsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/meeting-transcripts');
      const data = await response.json();

      if (data.success) {
        setTranscripts(data.transcripts || []);
      } else {
        setError(data.error || 'Failed to fetch transcripts');
      }
    } catch (err) {
      console.error('Error fetching transcripts:', err);
      setError('Failed to fetch transcripts');
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (id: string) => {
    try {
      const response = await fetch(`/api/meeting-transcripts?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTranscripts(prev => prev.filter(t => t.id !== id));
      } else {
        setError(data.error || 'Failed to delete transcript');
      }
    } catch (err) {
      console.error('Error deleting transcript:', err);
      setError('Failed to delete transcript');
    }
  };

  const downloadAudio = async (audioFilePath: string | null, meetingId: string) => {
    if (!audioFilePath) {
      alert('Аудио файл байхгүй');
      return;
    }

    try {
      // For now, create a download link (in production, you'd serve the actual file)
      const response = await fetch(`/api/download-audio?file=${audioFilePath}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${meetingId}-recording.wav`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Файл татахад алдаа');
      }
    } catch (err) {
      console.error('Error downloading audio:', err);
      alert('Файл татахад алдаа');
    }
  };

  if (loading) {
    return (
      <DepartmentHeadShell
        currentPath="/department_head/recordings"
        kicker="Recordings"
        title="Дуу бичлэгүүд"
        description="Бүх хурлын дуу бичлэгүүд болон тайлбаруудыг харах, удирдах"
        stats={[
          { label: "Нийт бичлэг", value: transcripts.length.toString() },
          { label: "Нийт тайлбар", value: transcripts.filter(t => t.transcript).length.toString() },
        ]}
      >
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-500">Ачаалж байна...</p>
        </div>
      </DepartmentHeadShell>
    );
  }

  if (error) {
    return (
      <DepartmentHeadShell
        currentPath="/department_head/recordings"
        kicker="Recordings"
        title="Дуу бичлэгүүд"
        description="Бүх хурлын дуу бичлэгүүд болон тайлбаруудыг харах, удирдах"
        stats={[
          { label: "Нийт бичлэг", value: "0" },
          { label: "Нийт тайлбар", value: "0" },
        ]}
      >
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchTranscripts}
            className="rounded-full bg-slate-950 px-6 py-3 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Дахин оролдох
          </button>
        </div>
      </DepartmentHeadShell>
    );
  }

  return (
    <DepartmentHeadShell
      currentPath="/department_head/recordings"
      kicker="Recordings"
      title="Дуу бичлэгүүд"
      description="Бүх хурлын дуу бичлэгүүд болон тайлбаруудыг харах, удирдах"
      stats={[
        { label: "Нийт бичлэг", value: transcripts.length.toString() },
        { label: "Нийт тайлбар", value: transcripts.filter(t => t.transcript).length.toString() },
      ]}
    >
      <div className="space-y-4">
        {transcripts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-lg p-8">
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8v8z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Орчинд бичлэгүүд алга</h3>
              <p className="text-slate-500">Та хурал дээр дуу бичлэг хийж, энд харах болно.</p>
            </div>
          </div>
        ) : (
          transcripts.map((transcript) => (
            <div key={transcript.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-[0.3em]">{transcript.meeting_id}</span>
                    <h3 className="text-lg font-semibold text-slate-950">{transcript.meeting_id}</h3>
                    <span className={`ml-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(transcript.meeting_id.includes('DM-001') ? 'Баталгаажсан' : transcript.meeting_id.includes('DM-002') ? 'Баталгаажсан' : 'Төлөвлөсөн')}`}>
                      {transcript.meeting_id.includes('DM-001') ? 'Баталгаажсан' : transcript.meeting_id.includes('DM-002') ? 'Баталгаажсан' : 'Төлөвлөсөн'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{transcript.transcript}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Үүсдэг: {new Date(transcript.created_at).toLocaleDateString('mn-MN')}</span>
                    <span className="ml-4">Хэрэглэг: {transcript.user_id || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {transcript.audio_file_path && (
                    <button
                      onClick={() => downloadAudio(transcript.audio_file_path, transcript.meeting_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 6h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8v8z" />
                      </svg>
                      Дуу татах
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteTranscript(transcript.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 5.58A2 2 0 00-2.828 0L7 14a2 2 0 00-2 2v2m0 6h4a2 2 0 002 2v2m0 6h4a2 2 0 002-2v2" />
                      </svg>
                      Устгах
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </DepartmentHeadShell>
  );
}

function getStatusClasses(meetingId: string) {
  if (meetingId.includes('DM-001') || meetingId.includes('DM-002')) {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-slate-100 text-slate-700";
}
