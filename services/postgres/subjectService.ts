import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Subject } from "@/models/postgres/types"

export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("SUBJECTS").select("*")

  if (error) {
    console.error("Error fetching subjects:", error)
    throw new Error("Failed to fetch subjects")
  }

  return data as Subject[]
}

export async function getSubjectByCode(code: string): Promise<Subject> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("SUBJECTS").select("*").eq("code", code).single()

  if (error) {
    console.error("Error fetching subject:", error)
    throw new Error("Failed to fetch subject")
  }

  return data as Subject
}
