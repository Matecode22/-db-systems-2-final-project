import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: subjects, error } = await supabase
      .from("subjects")
      .select(`
        *,
        faculties!inner (
          id,
          name
        )
      `)
      .order("name")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    const formattedSubjects =
      subjects?.map((subject) => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        credits: subject.credits,
        faculty_id: subject.faculty_id,
        faculty_name: subject.faculties?.name || "Facultad Desconocida",
      })) || []

    console.log(`✅ Found ${formattedSubjects.length} subjects from Supabase`)
    return NextResponse.json(formattedSubjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
