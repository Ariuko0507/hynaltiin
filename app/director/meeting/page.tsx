"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// ── Voice Recorder ────────────────────────────────────────────────────────────

interface Recording {
  id: string;
  name: string;
  duration: string;
  url: string;
  blob: Blob;
  date: string;
}

function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordings.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, [recordings]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}с`;
    return `${Math.floor(seconds / 60)}м ${seconds % 60}с`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        const name =
          recordingName.trim() ||
          `Бичлэг ${new Date().toLocaleTimeString("mn-MN", {
            hour: "2-digit",
            minute: "2-digit",
          })}`;

        const newRecording: Recording = {
          id: Date.now().toString(),
          name,
          duration: formatDuration(elapsed),
          url,
          blob,
          date: new Date().toLocaleDateString("mn-MN"),
        };
        setRecordings((prev) => [newRecording, ...prev]);
        setRecordingName("");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      alert("Микрофон ашиглах зөвшөөрөл олгоно уу.");
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const playRecording = (rec: Recording) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingId === rec.id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(rec.url);
    audioRef.current = audio;
    audio.play();
    setPlayingId(rec.id);
    audio.onended = () => setPlayingId(null);
  };

  const downloadRecording = (rec: Recording) => {
    const a = document.createElement("a");
    a.href = rec.url;
    a.download = `${rec.name}.webm`;
    a.click();
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((r) => r.id !== id);
    });
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  };

  return (
    <div className="mb-8 rounded-[32px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xl">🎙️</span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Дуу хоолойн бичлэг
        </h3>
      </div>

      <div className="mb-5 space-y-4">
        {!isRecording && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Бичлэгийн нэр (заавал биш)
            </label>
            <input
              type="text"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              placeholder="Жишээ: Хурлын тэмдэглэл..."
              className="block w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Бичлэг эхлэх
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-mono font-semibold">
                {!isPaused && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
                {isPaused && <span className="h-2 w-2 rounded-full bg-yellow-500" />}
                {formatTime(recordingTime)}
              </div>

              <button
                onClick={pauseRecording}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                {isPaused ? "▶ Үргэлжлүүлэх" : "⏸ Түр зогсоох"}
              </button>

              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
              >
                ⏹ Зогсоох
              </button>
            </>
          )}
        </div>
      </div>

      {recordings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
            Хадгалагдсан бичлэгүүд ({recordings.length})
          </p>
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => playRecording(rec)}
                  className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm transition ${
                    playingId === rec.id
                      ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {playingId === rec.id ? "⏸" : "▶"}
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {rec.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {rec.duration} · {rec.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => downloadRecording(rec)}
                  title="Татаж авах"
                  className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  ⬇
                </button>
                <button
                  onClick={() => deleteRecording(rec.id)}
                  title="Устгах"
                  className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-red-100 hover:text-red-600 transition dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {recordings.length === 0 && !isRecording && (
        <p className="text-sm text-zinc-400 dark:text-zinc-600 text-center py-4">
          Одоогоор бичлэг байхгүй байна
        </p>
      )}
    </div>
  );
}

// ── Meeting Page ──────────────────────────────────────────────────────────────

const initialMeetingItems = [
  {
    id: "M-001",
    title: "Сарын тайлангийн хурал",
    status: "Эхэлсэн",
    organizer: "Админ Бат",
    date: "2026-04-20",
  },
  {
    id: "M-002",
    title: "Төслийн явцын уулзалт",
    status: "Зассан",
    organizer: "Менежер Тэмүүжин",
    date: "2026-04-18",
  },
  {
    id: "M-003",
    title: "Стратегийн төлөвлөгөөний хурал",
    status: "Эсхийг",
    organizer: "Директор Энх",
    date: "2026-04-22",
  },
];

export default function DirectorMeetingPage() {
  const [items, setItems] = useState(initialMeetingItems);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string, newStatus: string) => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    ));
    setEditingId(null);
  };

  const sidebarLinks = [
    { href: "/director/dashboard", label: "Самбар", icon: "📊" },
    { href: "/director/tasks", label: "Даалгавар", icon: "📋" },
    { href: "/director/fulfillment", label: "Биелүүлэлт", icon: "✅" },
    { href: "/director/meeting", label: "Хурал", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Директор Панел</h2>
        </div>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span>🏠</span>
            Нүүр хуудас
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Директорыг хурал
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Хурлыг засварлах
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Статусыг засварлах эрхтэй.
            </p>
          </header>

          <VoiceRecorder />

          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Гарчиг</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Зохион байгуулагч</th>
                  <th className="px-6 py-4">Огноо</th>
                  <th className="px-6 py-4">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 font-medium text-zinc-950 dark:text-zinc-50">{item.id}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.title}</td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <select
                          value={item.status}
                          onChange={(e) => handleSave(item.id, e.target.value)}
                          className="rounded px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950"
                        >
                          <option value="Эхэлсэн">Эхэлсэн</option>
                          <option value="Зассан">Зассан</option>
                          <option value="Эсхийг">Эсхийг</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "Эхэлсэн"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                              : item.status === "Зассан"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.organizer}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.date}</td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          Цуцлах
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          Засварлах
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
