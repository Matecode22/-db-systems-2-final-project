import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subjectCode = searchParams.get("subjectCode")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("GROUPS").select(`
      number,
      semester,
      subject_code,
      professor_id,
      EMPLOYEES(first_name, last_name)
    `)

    // Filtrar por asignatura si se proporciona el código
    if (subjectCode) {
      query = query.eq("subject_code", subjectCode)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching groups:", error)
      return NextResponse.json({ error: "Error al obtener los grupos" }, { status: 500 })
    }

    // Transformar los datos para incluir el nombre del profesor
    const transformedData = data.map((group) => ({
      number: group.number,
      semester: group.semester,
      subject_code: group.subject_code,
      professor_id: group.professor_id,
      professor_name: group.EMPLOYEES ? `${group.EMPLOYEES.first_name} ${group.EMPLOYEES.last_name}` : null,
    }))

    return NextResponse.json(transformedData)
  } catch (error: any) {
    console.error("Error in groups API:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
