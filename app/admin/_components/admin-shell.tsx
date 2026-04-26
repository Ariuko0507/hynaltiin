import type { ReactNode } from "react";
import Link from "next/link";

type ShellStat = {
  label: string;
  value: string;
};

type AdminShellProps = {
  currentPath: string;
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
  stats?: ShellStat[];
  action?: ReactNode;
  noteTitle?: string;
  noteText?: string;
};

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Самбар", icon: "DS" },
  { href: "/admin/users", label: "Хэрэглэгч", icon: "US" },
  { href: "/admin/tasks", label: "Даалгавар", icon: "TK" },
  { href: "/admin/meeting", label: "Хурал", icon: "MT" },
];

export function AdminShell({
  currentPath,
  kicker,
  title,
  description,
  children,
  stats = [],
  action,
  noteTitle = "Анхаарах",
  noteText = "Системийн даалгавар, хурал, биелэлтийн төлөвүүдийг тогтмол хянаж шинэчилж байгаарай.",
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/80 px-6 py-8 backdrop-blur lg:block">
          <div className="rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Admin</p>
            <h2 className="mt-3 text-2xl font-semibold">Админы самбар</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Системийн хяналт, гүйцэтгэл, уулзалтын мэдээллийг нэг дороос удирдана.
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
            <p className="mt-3 text-sm leading-6 text-slate-600">{noteText}</p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.30)]">
              <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.38em] text-slate-300">{kicker}</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
                  {action ? <div className="mt-6">{action}</div> : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-[24px] bg-white/10 p-4 backdrop-blur">
                      <p className="text-sm text-slate-300">{item.label}</p>
                      <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
