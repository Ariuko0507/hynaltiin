// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (TypeScript interfaces)
export interface User {
  id: number
  name: string
  email: string
  position: 'director1' | 'director2' | 'manager' | 'department_head' | 'team_leader'
  role_id?: number
  department_id?: number | null
  manager_id?: number | null
  status?: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  task_code: string
  title: string
  description?: string | null
  status: 'new' | 'in_progress' | 'review' | 'corrected' | 're_verified' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string | null
  requires_response?: boolean
  response_text?: string | null
  completed_at?: string | null
  is_overdue?: boolean
  created_by?: number | null
  assigned_to?: number | null
  created_at: string
  updated_at: string
}

export interface Fulfillment {
  id: number
  fulfillment_code: string
  title: string
  description?: string | null
  task_id?: number | null
  status: 'sent' | 'approved' | 'rejected' | 'completed'
  sent_to?: number | null
  sent_by?: number | null
  sent_date?: string | null
  completed_date?: string | null
  pdf_url?: string | null
  pdf_exported_at?: string | null
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: number
  meeting_code: string
  meeting_type_id?: number | null
  title: string
  description?: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  organizer_id: number
  meeting_date: string
  location?: string | null
  manager_reaction?: 'approved' | 'rejected' | 'noted' | null
  manager_reaction_at?: string | null
  manager_comment?: string | null
  created_at: string
  updated_at: string
}
