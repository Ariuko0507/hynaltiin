"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function EmployeeMeetingPage() {
  const [items, setItems] = useState(initialMeetingItems);
  const [showForm, setShowForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    status: "Эхэлсэн",
    date: "",
  });

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleSend = () => {
    if (newMeeting.title && newMeeting.date) {
      const newItem = {
        id: `M-${String(items.length + 1).padStart(3, "0")}`,
        title: newMeeting.title,
        status: newMeeting.status,
        organizer: "Ажилтан",
        date: newMeeting.date,
      };
      setItems([...items, newItem]);
      setNewMeeting({ title: "", status: "Эхэлсэн", date: "" });
      setShowForm(false);
    }
  };

  const sidebarLinks = [
    { href: "/employee/dashboard", label: "Самбар", icon: "📊" },
    { href: "/employee/tasks", label: "Даалгавар", icon: "📋" },
    { href: "/employee/fulfillment", label: "Биелүүлэлт", icon: "✅" },
    { href: "/employee/meeting", label: "Хурал", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Ажилтан Панел</h2>
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
              Ажилтны хурал
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Хурал үүсгэх
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Хурал үүсгэх болон илгээх эрхтэй.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCreate}
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Хурал үүсгэх
              </button>
            </div>
          </header>

          {showForm && (
            <div className="mb-8 rounded-[32px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="mb-4 text-lg font-semibold">Шинэ хурал үүсгэх</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Гарчиг
                  </label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Статус
                  </label>
                  <select
                    value={newMeeting.status}
                    onChange={(e) => setNewMeeting({ ...newMeeting, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="Эхэлсэн">Эхэлсэн</option>
                    <option value="Зассан">Зассан</option>
                    <option value="Эсхийг">Эсхийг</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Огноо
                  </label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSend}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                >
                  Илгээх
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Цуцлах
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Гарчиг</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Зохион байгуулагч</th>
                  <th className="px-6 py-4">Огноо</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-6 py-4 font-medium text-zinc-950 dark:text-zinc-50">{item.id}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.title}</td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.organizer}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.date}</td>
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
