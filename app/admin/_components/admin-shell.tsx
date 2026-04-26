"use client";

import Link from "next/link";
import { ReactNode } from "react";

type AdminShellProps = {
  currentPath: string;
  kicker: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  action?: ReactNode;
  noteTitle?: string;
  noteText?: string;
  children: ReactNode;
};

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Самбар", icon: "📊" },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: "👥" },
  { href: "/admin/tasks", label: "Даалгавар", icon: "📋" },
  { href: "/admin/meeting", label: "Хурал", icon: "👥" },
];

export function AdminShell({
  currentPath,
  kicker,
  title,
  description,
  stats,
  action,
  noteTitle = "Анхаарах",
  noteText = "Админ эрхийн өөрчлөлтүүдийг системийн бүртгэлд тусгаж байгаарай.",
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/80 px-6 py-8 backdrop-blur lg:block">
          <div className="rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Admin</p>
            <h2 className="mt-3 text-2xl font-semibold">Админ Панел</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Системийн удирдлага, хяналт, бодлого
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  link.href === currentPath
                    ? "bg-slate-950 text-white shadow-lg"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/20 text-[11px] font-semibold">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{noteTitle}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {noteText}
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950 transition"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/20 text-[11px] font-semibold">
                🏠
              </span>
              Нүүр хуудас
            </Link>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <header className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{kicker}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{stat.value}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
