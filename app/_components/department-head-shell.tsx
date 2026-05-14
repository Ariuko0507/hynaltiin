"use client";

import { ReactNode } from "react";

interface DepartmentHeadShellProps {
  currentPath: string;
  kicker: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string }>;
  action?: ReactNode;
  children: ReactNode;
}

export function DepartmentHeadShell({ 
  currentPath, 
  kicker, 
  title, 
  description, 
  stats, 
  action, 
  children 
}: DepartmentHeadShellProps) {
  const isActive = (path: string) => currentPath === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-16">
        <div className="flex-1 flex">
          <div className="w-64 bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8v8z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{kicker}</h1>
                <p className="text-sm text-slate-600">{title}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 flex-1 flex flex-col">
          <div className="flex-1">
            <nav className="space-y-1">
              <a href="/department_head/dashboard" className={`block px-6 py-3 text-sm font-medium transition-colors rounded-lg ${isActive('/department_head/dashboard') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                Самбар
              </a>
              <a href="/department_head/tasks" className={`block px-6 py-3 text-sm font-medium transition-colors rounded-lg ${isActive('/department_head/tasks') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                Даалгавар
              </a>
              <a href="/department_head/fulfillment" className={`block px-6 py-3 text-sm font-medium transition-colors rounded-lg ${isActive('/department_head/fulfillment') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                Биелэлт
              </a>
              <a href="/department_head/department_meetings" className={`block px-6 py-3 text-sm font-medium transition-colors rounded-lg ${isActive('/department_head/department_meetings') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                Хурал
              </a>
              <a href="/department_head/notifications" className={`block px-6 py-3 text-sm font-medium transition-colors rounded-lg ${isActive('/department_head/notifications') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                Мэдэгдэл
              </a>
              <a href="/department_head/recordings" className={`block px-6 py-3 text-sm font-medium transition-colors rounded-lg ${isActive('/department_head/recordings') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                Дуу бичлэгүүд
              </a>
            </nav>
          </div>

          <main className="flex-1 p-6">
            <div className="max-w-7xl">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    {description && <p className="mt-2 text-slate-600">{description}</p>}
                  </div>
                  {action && <div>{action}</div>}
                </div>

                {stats && (
                  <div className="flex gap-8 mt-8">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-sm text-slate-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
