import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching complete database overview...")

    // Obtener todos los datos de las tablas principales
    const [
      groupsResult,
      subjectsResult,
      employeesResult,
      campusesResult,
      programsResult,
      areasResult,
      facultiesResult,
    ] = await Promise.allSettled([
      supabase.from("groups").select("*"),
      supabase.from("subjects").select("*"),
      supabase.from("employees").select("*"),
      supabase.from("campuses").select("*"),
      supabase.from("programs").select("*"),
      supabase.from("areas").select("*"),
      supabase.from("faculties").select("*"),
    ])

    const result = {
      groups: groupsResult.status === "fulfilled" ? groupsResult.value.data || [] : [],
      subjects: subjectsResult.status === "fulfilled" ? subjectsResult.value.data || [] : [],
      employees: employeesResult.status === "fulfilled" ? employeesResult.value.data || [] : [],
      campuses: campusesResult.status === "fulfilled" ? campusesResult.value.data || [] : [],
      programs: programsResult.status === "fulfilled" ? programsResult.value.data || [] : [],
      areas: areasResult.status === "fulfilled" ? areasResult.value.data || [] : [],
      faculties: facultiesResult.status === "fulfilled" ? facultiesResult.value.data || [] : [],
    }

    console.log("📊 Database overview:")
    console.log(`- Groups: ${result.groups.length}`)
    console.log(`- Subjects: ${result.subjects.length}`)
    console.log(`- Employees: ${result.employees.length}`)
    console.log(`- Campuses: ${result.campuses.length}`)
    console.log(`- Programs: ${result.programs.length}`)
    console.log(`- Areas: ${result.areas.length}`)
    console.log(`- Faculties: ${result.faculties.length}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching database overview:", error)
    return NextResponse.json(
      {
        error: "Error fetching database overview",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
