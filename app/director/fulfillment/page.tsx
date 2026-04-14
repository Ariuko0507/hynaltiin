"use client";

import { useState } from "react";
import Link from "next/link";

const initialFulfillmentItems = [
  {
    id: "F-001",
    title: "Захиалга 1 - Бараа хүргэлт",
    status: "Эхэлсэн",
    assigned: "Ажилтан Сарнай",
    due: "2026-04-16",
  },
  {
    id: "F-002",
    title: "Захиалга 2 - Үйлчилгээ дуусгах",
    status: "Зассан",
    assigned: "Менежер Тэмүүжин",
    due: "2026-04-15",
  },
  {
    id: "F-003",
    title: "Захиалга 3 - Баталгаажуулалт",
    status: "Эсхийг",
    assigned: "Директор Энх",
    due: "2026-04-18",
  },
];

export default function DirectorFulfillmentPage() {
  const [items, setItems] = useState(initialFulfillmentItems);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string, newStatus: string) => {
    setItems(items.map(item =>
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
              Директорыг биелүүлэлт
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Биелүүлэлтийг засварлах
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Статусыг засварлах эрхтэй.
            </p>
          </header>

          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Гарчиг</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Хариуцагч</th>
                  <th className="px-6 py-4">Хугацаа</th>
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
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.assigned}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{item.due}</td>
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
