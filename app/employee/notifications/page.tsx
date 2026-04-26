"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmployeeShell } from "../_components/employee-shell";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  date: string;
  isRead: boolean;
  link?: string;
};

function getTypeClasses(type: NotificationItem["type"]) {
  if (type === "success") return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (type === "warning") return "bg-amber-50 border-amber-200 text-amber-700";
  if (type === "alert") return "bg-red-50 border-red-200 text-red-700";
  return "bg-blue-50 border-blue-200 text-blue-700";
}

function getTypeIcon(type: NotificationItem["type"]) {
  if (type === "success") return "✓";
  if (type === "warning") return "⚠";
  if (type === "alert") return "⚡";
  return "ℹ";
}

// Employee user ID (in real app, get from auth context)
const CURRENT_USER_ID = 4; // Ажилтан Сарнай's ID

export default function EmployeeNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications from database
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications?user_id=${CURRENT_USER_ID}`);
      
      if (response.ok) {
        const data = await response.json();
        const transformed = data.notifications.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          type: n.type,
          date: new Date(n.created_at).toLocaleString("mn-MN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: n.is_read,
          link: n.link,
        }));
        setNotifications(transformed);
      } else {
        setError("Мэдэгдэл ачаалахад алдаа гарлаа");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Мэдэгдэл ачаалахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications?id=${notification.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: true }),
        });
        
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
    
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications?id=${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_read: true }),
          })
        )
      );
      
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <EmployeeShell
      currentPath="/employee/notifications"
      kicker="Notifications"
      title="Мэдэгдлүүд"
      description="Таны бүх мэдэгдэл, мэдээлэл энд харагдана."
      stats={[
        { label: "Нийт", value: String(notifications.length) },
        { label: "Уншаагүй", value: String(unreadCount) },
      ]}
      notifications={unreadCount}
    >
      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-950">
            {unreadCount > 0 ? `${unreadCount} шинэ мэдэгдэл` : "Бүх мэдэгдэл уншигдсан"}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-slate-600 hover:text-slate-950 transition"
            >
              Бүгдийг уншсан болгох
            </button>
          )}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-2xl mb-3 animate-spin">⏳</p>
              <p>Мэдэгдэл ачаалж байна...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-4xl mb-3">⚠️</p>
              <p>{error}</p>
              <button
                onClick={fetchNotifications}
                className="mt-4 text-sm text-slate-600 hover:text-slate-950 underline"
              >
                Дахин оролдох
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-3">🔔</p>
              <p>Мэдэгдэл байхгүй</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`rounded-2xl border p-4 transition cursor-pointer hover:shadow-md ${
                  notification.isRead
                    ? "bg-slate-50 border-slate-200 opacity-75"
                    : getTypeClasses(notification.type)
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${notification.isRead ? "text-slate-700" : "text-slate-950"}`}>
                        {notification.title}
                        {!notification.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                      </h3>
                      <span className="text-xs text-slate-500">{notification.date}</span>
                    </div>
                    <p className={`mt-1 text-sm ${notification.isRead ? "text-slate-600" : "text-slate-700"}`}>
                      {notification.message}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-950 transition"
                        >
                          Уншсан болгох
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs font-medium text-slate-400 hover:text-red-600 transition"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </EmployeeShell>
  );
}
