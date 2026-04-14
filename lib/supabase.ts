// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env as any).NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
const isConfigured = supabaseUrl &&
                     supabaseAnonKey &&
                     supabaseUrl !== 'your_supabase_project_url_here' &&
                     supabaseAnonKey !== 'your_supabase_anon_key_here' &&
                     supabaseUrl.startsWith('https://')

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => isConfigured

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
  status: 'Эхэлсэн' | 'Зассан' | 'Эсхийг'
  organizer?: number
  meeting_date?: string
  created_at: string
  updated_at: string
}