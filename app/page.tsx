import Link from "next/link";
import { approvalFlow, platformFeatures, workflowRoles } from "@/lib/workflow-config";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eff6ff_36%,_#f8fafc_100%)] px-6 py-10 text-slate-950">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[40px] border border-white/70 bg-white/85 p-8 shadow-[0_35px_90px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">Workflow Overview</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Танай байгууллагын баталгаажуулалт, биелэлт, хурлын урсгал
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Director 1, Director 2, Manager, Department Head, Leader, ажилтан гэсэн шатлалтайгаар
                даалгавар, comment, засвар, биелэлт, PDF, schedule, notification, evaluation-г нэг мөр урсгалд харуулах нүүр хэсэг.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/director1/dashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                Director 1
              </Link>
              <Link href="/director2/dashboard" className="rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white">
                Director 2
              </Link>
              <Link href="/manager/meeting" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
                Manager Meeting
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-5">
          {workflowRoles.map((role) => (
            <article key={role.id} className={`rounded-[30px] border p-5 shadow-sm ${role.accent}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-70">{role.label}</p>
              <h2 className="mt-3 text-xl font-semibold leading-8">{role.title}</h2>
              <div className="mt-5 space-y-3 text-sm leading-6 opacity-90">
                {role.responsibilities.map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 p-3">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[34px] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_28px_70px_rgba(15,23,42,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Approval Chain</p>
            <h2 className="mt-3 text-3xl font-semibold">Даалгавар ба биелэлтийн шаталсан урсгал</h2>
            <div className="mt-6 space-y-3">
              {approvalFlow.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl bg-white/10 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-100">{step}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Platform Features</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Web дээр заавал харагдах боломжууд</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {platformFeatures.map((feature) => (
                <div key={feature.title} className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{feature.emphasis}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
