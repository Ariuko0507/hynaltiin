import { ManagerShell } from "../_components/manager-shell";

const managerData = {
  name: "Менежер Тэмүүжин",
  email: "manager@example.com",
  role: "Менежер",
  department: "Төсөл хэрэгжүүлэлт",
  lastReview: "2026-04-20",
};

const quickStats = [
  { label: "Багийн гүйцэтгэл", value: "87%" },
  { label: "Төслийн биелэлт", value: "12/15" },
  { label: "Хүлээгдэж буй даалгавар", value: "8" },
  { label: "Идэвхтэй ажилтан", value: "6" },
];

const highlights = [
  "Багийн гүйцэтгэл 87% байна.",
  "15 төслөөс 12 нь хугацаанд биелэгдэж байна.",
  "8 шинэ даалгавар хүлээгдэж байна.",
];

const tasks = [
  "Багийн гишүүдэд даалгавар тараах.",
  "Төслийн явцын тайланг шалгах.",
  "Хурлын товлолт, бэлтгэл хийх.",
];

export default function ManagerDashboardPage() {
  return (
    <ManagerShell
      currentPath="/manager/dashboard"
      kicker="Manager"
      title="Менежерийн самбар"
      description="Багийн ажил, төсөл, гүйцэтгэлийг хянах."
      stats={[
        { label: "Нийт даалгавар", value: "12" },
        { label: "Хийгдэж буй", value: "5" },
        { label: "Хүлээгдэж буй", value: "3" },
        { label: "Дууссан", value: "4" },
      ]}
      notifications={2}
    >
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
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">И-мэйл</p>
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Албан тушаал</p>
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Хэлтэс</p>
                <p className="mt-2 text-base font-medium text-slate-950">{managerData.department}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Өнөөдрийн фокус</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Хийх зүйлс</h2>
            <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
              {tasks.map((task) => (
                <div key={task} className="rounded-2xl bg-slate-50 p-4">
                  {task}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Тойм</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Товч тойм</h2>
            <div className="mt-6 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Нэмэлт</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Түүнчлэн</h2>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Багийн хурал товлох</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Ажилтнуудын гүйцэтгэлийн тайлан харах</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Даалгавар хуваарилалт, хугацааг зохицуулах</span>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </ManagerShell>
  );
}
