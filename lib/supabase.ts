// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env as any).NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (TypeScript interfaces)
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'director' | 'manager' | 'employee'
  department?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  task_id: string
  title: string
  description?: string
  status: 'Эхэлсэн' | 'Зассан' | 'Эсхийг'
  due_date?: string
  created_by?: number
  assigned_to?: number
  created_at: string
  updated_at: string
}

export interface Fulfillment {
  id: number
  fulfillment_id: string
  title: string
  description?: string
  status: 'Илгээсэн' | 'Баталгаажсан' | 'Буцаасан'
  sent_to?: number
  sent_by?: number
  sent_date?: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: number
  meeting_id: string
  title: string
  description?: string
  status: 'Төлөвлөсөн' | 'Баталгаажсан' | 'Цуцлагдсан'
  organizer_id: number
  meeting_date: string
  location?: string
  team_id?: number
  manager_reaction?: string
  manager_reaction_at?: string
  manager_comment?: string
  created_at: string
  updated_at: string
}