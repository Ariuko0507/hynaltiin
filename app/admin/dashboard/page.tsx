import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "../_components/admin-shell";

type AdminInfo = {
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  permissions: string[];
  alerts: string[];
};

async function getAdminInfo(): Promise<AdminInfo> {
  // Get admin user (assuming first admin user)
  const { data: adminUser, error: userError } = await supabase
    .from("users")
    .select("name, email, role_id, department_id, updated_at")
    .eq("role_id", 1) // admin role
    .limit(1)
    .single();

  if (userError || !adminUser) {
    console.error("Error fetching admin user:", userError?.message);
    return {
      name: "Админ",
      email: "admin@example.com",
      role: "Системийн админ",
      department: "IT удирдлага",
      lastLogin: "Тодорхойгүй",
      permissions: ["Хэрэглэгчийн эрх удирдах", "Системийн тохиргоог өөрчлөх"],
      alerts: ["Системийн шинэчлэлт шаардлагатай"],
    };
  }

  // Get department name
  const { data: department } = adminUser.department_id
    ? await supabase.from("departments").select("name").eq("id", adminUser.department_id).single()
    : { data: null };

  // Get role name
  const { data: role } = await supabase.from("roles").select("name").eq("id", adminUser.role_id).single();

  return {
    name: adminUser.name,
    email: adminUser.email,
    role: role?.name === "admin" ? "Системийн админ" : role?.name || "Админ",
    department: department?.name || "IT удирдлага",
    lastLogin: adminUser.updated_at ? new Date(adminUser.updated_at).toLocaleString("mn-MN") : "Тодорхойгүй",
    permissions: [
      "Хэрэглэгчийн эрх удирдах",
      "Системийн тохиргоог өөрчлөх",
      "Аудит ба тайлан үүсгэх",
      "Өгөгдлийг нөөцлөх болон сэргээх",
    ],
    alerts: [
      "Нууц үг шинэчлэх шаардлагатай.",
      "Системийн шинэчлэлт иргэддээ зарлах.",
    ],
  };
}

export default async function AdminDashboardPage() {
  const adminInfo = await getAdminInfo();

  return (
    <AdminShell
      currentPath="/admin/dashboard"
      kicker="Dashboard"
      title="Системийн эрх, байршил, мэдэгдлүүд"
      description="Админы профайл, эрхүүд, системийн анхааруулга болон дэмжлэгийн мэдээллийг нэг загвартайгаар хянаж удирдана."
      stats={[
        { label: "Үйлдлийн эрх", value: String(adminInfo.permissions.length) },
        { label: "Анхааруулга", value: String(adminInfo.alerts.length) },
        { label: "Хэлтэс", value: "1" },
        { label: "Идэвхтэй хэрэглэгч", value: "1" },
      ]}
      action={
        <Link
          href="/"
          className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Нүүр хуудас
        </Link>
      }
      noteText="Эрхийн өөрчлөлт хийхийн өмнө аудитын лог болон анхааруулгуудыг шалгаарай."
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Админы мэдээлэл</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Нэр</p>
                <p className="mt-2 text-base font-medium text-slate-950">{adminInfo.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">И-мэйл</p>
                <p className="mt-2 text-base font-medium text-slate-950">{adminInfo.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Роль</p>
                <p className="mt-2 text-base font-medium text-slate-950">{adminInfo.role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Тасаг</p>
                <p className="mt-2 text-base font-medium text-slate-950">{adminInfo.department}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-sm text-slate-500">Сүүлд нэвтэрсэн</p>
                <p className="mt-2 text-base font-medium text-slate-950">{adminInfo.lastLogin}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Үйлдлийн эрх</h2>
            <div className="mt-6 space-y-3">
              {adminInfo.permissions.map((permission) => (
                <div key={permission} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {permission}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Мэдэгдэл</h2>
            <div className="mt-6 space-y-3">
              {adminInfo.alerts.map((alert) => (
                <div key={alert} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {alert}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Дэмжлэгийн холбоос</h2>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="rounded-2xl bg-slate-50 p-4">Нууц үг солих</li>
              <li className="rounded-2xl bg-slate-50 p-4">Системийн лог харах</li>
              <li className="rounded-2xl bg-slate-50 p-4">Үйлдлийн аудит татах</li>
              <li className="rounded-2xl bg-slate-50 p-4">Хэрэглэгчийн мэдээлэл засварлах</li>
            </ul>
          </article>
        </div>
      </section>
    </AdminShell>
  );
}