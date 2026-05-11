"use client";

import Link from "next/link";
import { useMemo } from "react";

type AssignmentStatus = "Хүлээгдэж байна" | "Ажиллаж байна" | "Хоцорсон" | "Дууссан";
type PersonalAssignment = {
  id: string;
  title: string;
  status: AssignmentStatus;
  dueDate: string;
  assignedBy: string;
  deliveryTo: string;
  deliveryLocation: string;
  description: string;
  urgencyRank: number;
};

type TeamAssignment = {
  memberName: string;
  role: string;
  task: string;
  status: AssignmentStatus;
  dueDate: string;
};

const sidebarLinks = [
  { href: "/employee/dashboard", label: "Самбар", icon: "DS" },
  { href: "/employee/tasks", label: "Даалгавар", icon: "TK" },
  { href: "/employee/fulfillment", label: "Биелэлт", icon: "FL" },
  { href: "/employee/meeting", label: "Хурал", icon: "MT" },
];

const personalAssignments: PersonalAssignment[] = [
  {
    id: "WA-101",
    title: "Сарын хяналтын тайлан бэлтгэх",
    status: "Ажиллаж байна",
    dueDate: "2026-04-29 17:00",
    assignedBy: "Менежер Тэмүүжин",
    deliveryTo: "Директор Энх",
    deliveryLocation: "Дотоод систем / Тайлан хэсэг",
    description: "Сарын гүйцэтгэл, илэрсэн асуудал, дүгнэлтээ нэгтгэж тайлан бэлтгэнэ.",
    urgencyRank: 2,
  },
  {
    id: "WA-102",
    title: "Шалгалтын бүртгэлийн хүснэгт шинэчлэх",
    status: "Хүлээгдэж байна",
    dueDate: "2026-04-30 12:00",
    assignedBy: "Ахлах ажилтан Саруул",
    deliveryTo: "Багийн ахлагч Номин",
    deliveryLocation: "Бичиг хэргийн өрөө",
    description: "Шалгалтад хамрагдсан байгууллагын бүртгэлийг шинэ хүснэгтэд нэг мөрлөн оруулна.",
    urgencyRank: 3,
  },
  {
    id: "WA-103",
    title: "Салбарын гомдлын мөрөөр хариу хүргүүлэх",
    status: "Хоцорсон",
    dueDate: "2026-04-25 18:00",
    assignedBy: "Менежер Тэмүүжин",
    deliveryTo: "Иргэдтэй ажиллах нэгж",
    deliveryLocation: "1 давхар, үйлчилгээний цонх",
    description: "Гомдлын мөрөөр авсан арга хэмжээ, хүргүүлсэн хариуг нэгтгэнэ.",
    urgencyRank: 1,
  },
  {
    id: "WA-104",
    title: "Багийн долоо хоногийн мэдээ нэгтгэх",
    status: "Дууссан",
    dueDate: "2026-04-26 15:00",
    assignedBy: "Багийн ахлагч Номин",
    deliveryTo: "Менежер Тэмүүжин",
    deliveryLocation: "Google Drive / Team folder",
    description: "Багийн гишүүдийн долоо хоногийн мэдээллийг нэгтгэж байршуулна.",
    urgencyRank: 4,
  },
];

const teamAssignments: TeamAssignment[] = [
  {
    memberName: "Номин",
    role: "Багийн ахлагч",
    task: "7 хоногийн тайлан нэгтгэх",
    status: "Ажиллаж байна",
    dueDate: "2026-04-28 16:00",
  },
  {
    memberName: "Саруул",
    role: "Шинжээч",
    task: "Шалгалтын дүн баталгаажуулах",
    status: "Хүлээгдэж байна",
    dueDate: "2026-04-29 11:00",
  },
  {
    memberName: "Бат-Эрдэнэ",
    role: "Хяналтын ажилтан",
    task: "Талбарын зураг, нотлох баримт байршуулах",
    status: "Дууссан",
    dueDate: "2026-04-26 15:00",
  },
];

const quickStats = [
  { label: "Надад оноосон", value: "12" },
  { label: "Өнөөдөр дуусах", value: "3" },
  { label: "Хоцорсон ажил", value: "1" },
  { label: "Багийн гишүүд", value: "4" },
];

function getStatusClasses(status: AssignmentStatus) {
  if (status === "Дууссан") return "bg-emerald-100 text-emerald-700";
  if (status === "Ажиллаж байна") return "bg-sky-100 text-sky-700";
  if (status === "Хоцорсон") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export default function EmployeeDashboardPage() {
  const employee = {
    name: "Сарнай",
    fullName: "Ажилтан Сарнай",
    role: "Хяналтын ажилтан",
    department: "Хяналт шалгалтын хэлтэс",
    team: "Баримт шалгалтын баг",
    email: "employee@example.com",
    phone: "+976 9000 0004",
  };

  const previewAssignments = useMemo(
    () => [...personalAssignments].sort((a, b) => a.urgencyRank - b.urgencyRank).slice(0, 2),
    []
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/80 px-6 py-8 backdrop-blur lg:block">
          <div className="rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Employee</p>
            <h2 className="mt-3 text-2xl font-semibold">Ажилтны самбар</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Өөрийн мэдээлэл, хийх ажил, багийн явцыг нэг дороос харна.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  link.href === "/employee/dashboard"
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
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Анхаарах</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Хоцорсон ажлын биелэлтийг эхэлж шинэчилж, дараа нь хүргүүлэх байршил болон
              хүлээн авагчийг шалгаарай.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.30)]">
              <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.38em] text-slate-300">Dashboard</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {employee.name}, таны хийх ажил болон багийн явц энд харагдана
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                    Та өөрийн профайл, танд оноосон даалгавар, тулсан ажлууд болон багийн
                    ажилтнуудын хариуцсан үүргийг нэг дэлгэцээс хянах боломжтой.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  {quickStats.map((item) => (
                    <div key={item.label} className="rounded-[24px] bg-white/10 p-4 backdrop-blur">
                      <p className="text-sm text-slate-300">{item.label}</p>
                      <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Профайл</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Миний мэдээлэл</h2>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Нэр</p>
                      <p className="mt-2 text-base font-medium text-slate-950">{employee.fullName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Албан тушаал</p>
                      <p className="mt-2 text-base font-medium text-slate-950">{employee.role}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Хэлтэс</p>
                      <p className="mt-2 text-base font-medium text-slate-950">{employee.department}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Баг</p>
                      <p className="mt-2 text-base font-medium text-slate-950">{employee.team}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">И-мэйл</p>
                      <p className="mt-2 text-base font-medium text-slate-950">{employee.email}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Утас</p>
                      <p className="mt-2 text-base font-medium text-slate-950">{employee.phone}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Өнөөдрийн фокус</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хийх зүйлс</h2>
                  <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-4">Хоцорсон ажлын шалтгааныг тайлбарлаж шинэчлэ.</div>
                    <div className="rounded-2xl bg-slate-50 p-4">Тайлангийн хавсралт файлуудаа бүрэн эсэхийг шалга.</div>
                    <div className="rounded-2xl bg-slate-50 p-4">Хүргүүлэх хүлээн авагч, байршлын мэдээллээ баталгаажуул.</div>
                  </div>
                </article>
              </div>

              <div className="space-y-6">
                <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Миний ажлууд</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">2 яаралтай ажил</h2>
                    </div>
                    <Link
                      href="/employee/tasks"
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Бүгдийг харах
                    </Link>
                  </div>

                  <div className="mt-6 space-y-4">
                    {previewAssignments.map((assignment) => (
                      <div key={assignment.id} className="w-full rounded-[24px] border border-slate-200 bg-white p-4 text-left">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                              {assignment.id}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-950">{assignment.title}</h3>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              assignment.status
                            )}`}
                          >
                            {assignment.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-400">Хэзээ дуусах</p>
                            <p className="mt-1 font-medium text-slate-950">{assignment.dueDate}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-400">Хэнээс ирсэн</p>
                            <p className="mt-1 font-medium text-slate-950">{assignment.assignedBy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Багийн самбар</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                        Багийн ажилтнуудын хариуцсан үүрэг
                      </h2>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {employee.team}
                    </span>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Ажилтан</th>
                            <th className="px-4 py-3 font-medium">Үүрэг</th>
                            <th className="px-4 py-3 font-medium">Даалгавар</th>
                            <th className="px-4 py-3 font-medium">Дуусах хугацаа</th>
                            <th className="px-4 py-3 font-medium">Төлөв</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {teamAssignments.map((assignment) => (
                            <tr key={`${assignment.memberName}-${assignment.task}`}>
                              <td className="px-4 py-4 font-medium text-slate-950">{assignment.memberName}</td>
                              <td className="px-4 py-4 text-slate-700">{assignment.role}</td>
                              <td className="px-4 py-4 text-slate-700">{assignment.task}</td>
                              <td className="px-4 py-4 text-slate-700">{assignment.dueDate}</td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                    assignment.status
                                  )}`}
                                >
                                  {assignment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}