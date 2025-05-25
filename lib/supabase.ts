import { createClient } from "@supabase/supabase-js"
import { env } from "./env"

export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Cliente con privilegios de servicio para operaciones administrativas
export const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// Tipos para las tablas de Supabase (mantener los existentes)
export interface Campus {
  id: number
  name: string
  city_id: number
  address: string
}

export interface Subject {
  id: number
  name: string
  code: string
  credits: number
  faculty_id: number
}

export interface Group {
  id: number
  subject_id: number
  group_number: string
  semester: string
  year: number
  employee_id: number
  campus_id: number
}

export interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  employee_type_id: number
}
