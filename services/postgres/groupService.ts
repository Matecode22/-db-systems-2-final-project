import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Group } from "@/models/postgres/types"

export async function getAllGroups(): Promise<Group[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("GROUPS").select("*")

  if (error) {
    console.error("Error fetching groups:", error)
    throw new Error("Failed to fetch groups")
  }

  return data as Group[]
}

export async function getGroupsBySubject(subjectCode: string): Promise<Group[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("GROUPS").select("*").eq("subject_code", subjectCode)

  if (error) {
    console.error("Error fetching groups by subject:", error)
    throw new Error("Failed to fetch groups by subject")
  }

  return data as Group[]
}

export async function getGroupDetails(number: number, subjectCode: string, semester: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("GROUPS")
    .select(`
      *,
      SUBJECTS(name),
      EMPLOYEES(first_name, last_name)
    `)
    .eq("number", number)
    .eq("subject_code", subjectCode)
    .eq("semester", semester)
    .single()

  if (error) {
    console.error("Error fetching group details:", error)
    throw new Error("Failed to fetch group details")
  }

  return data
}
