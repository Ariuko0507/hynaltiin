import { DirectorShell } from "../_components/director-shell";

const directorData = {
  name: "Директор Энх",
  email: "director@example.com",
  role: "Директор",
  division: "Үйл ажиллагааны захиргаа",
  lastReview: "2026-04-13",
};

const quickStats = [
  { label: "Төсвийн гүйцэтгэл", value: "91%" },
  { label: "Стратегийн зорилт", value: "79%" },
  { label: "Шинэ түншлэл", value: "5" },
  { label: "Хүлээгдэж буй шийдвэр", value: "3" },
];

const highlights = [
  "Төсвийн гүйцэтгэл 91% байна.",
  "Стратегийн зорилт 79%-тай биелэгдэж байна.",
  "Шинэ түншлэл 5 байгуулж амжилттай.",
];

const tasks = [
  "Компани зорилтуудыг хүлээн зөвшөөрөх.",
  "Гүйцэтгэлийн тайланг харах.",
  "Хуваарь, стратеги хурлыг товлох.",
];

export default function DirectorDashboardPage() {
  return (
    <DirectorShell
      currentPath="/director/dashboard"
      kicker="Director"
      title="Директорын самбар"
      description="Стратеги, гүйцэтгэл, төслийн тоймыг нэг дороос хянах."
      stats={[
        { label: "Нийт төсөл", value: "12" },
        { label: "Идэвхтэй", value: "8" },
        { label: "Биелэлт хүлээж буй", value: "3" },
        { label: "Хурал", value: "5" },
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
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">И-мэйл</p>
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Албан тушаал</p>
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Тасаг</p>
                <p className="mt-2 text-base font-medium text-slate-950">{directorData.division}</p>
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
                <span>Стратегийн хурал товлох</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Төсөв, гүйцэтгэлийн тайлан харах</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Гол түншлэл, өсөлтийн боломжийг дүгнэх</span>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </DirectorShell>
  );
}
