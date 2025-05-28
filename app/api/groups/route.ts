import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching groups from Supabase with correct structure...")

    // Obtener todos los grupos usando la estructura real
    const { data: groups, error: groupsError } = await supabase.from("groups").select("*").order("number")

    if (groupsError) {
      console.error("Error fetching groups:", groupsError)
      return NextResponse.json(
        {
          error: "Error fetching groups",
          details: groupsError.message,
        },
        { status: 500 },
      )
    }

    console.log(`📊 Found ${groups?.length || 0} groups`)

    // Obtener todas las materias usando la columna 'code'
    const { data: subjects, error: subjectsError } = await supabase.from("subjects").select("*")

    if (subjectsError) {
      console.warn("Error fetching subjects:", subjectsError.message)
    }

    console.log(`📚 Found ${subjects?.length || 0} subjects`)

    // Obtener todos los empleados usando la columna 'id'
    const { data: employees, error: employeesError } = await supabase.from("employees").select("*")

    if (employeesError) {
      console.warn("Error fetching employees:", employeesError.message)
    }

    console.log(`👥 Found ${employees?.length || 0} employees`)

    // Obtener todos los campus
    const { data: campuses, error: campusesError } = await supabase.from("campuses").select("*")

    if (campusesError) {
      console.warn("Error fetching campuses:", campusesError.message)
    }

    console.log(`🏢 Found ${campuses?.length || 0} campuses`)

    // Formatear los datos usando la estructura real
    const formattedGroups =
      groups?.map((group) => {
        const subject = subjects?.find((s) => s.code === group.subject_code)
        const employee = employees?.find((e) => e.id === group.professor_id)

        // Crear un ID único combinando las claves primarias
        const uniqueId = `${group.number}-${group.subject_code}-${group.semester}`

        return {
          // ID único para el frontend
          id: uniqueId,
          // Datos originales
          number: group.number,
          semester: group.semester,
          subject_code: group.subject_code,
          professor_id: group.professor_id,
          // Datos enriquecidos
          subject_name: subject?.name || "Materia Desconocida",
          professor_name: employee
            ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
            : "Profesor Desconocido",
          // Para compatibilidad con el frontend existente
          group_number: group.number.toString(),
          year: Number.parseInt(group.semester.split("-")[0]) || new Date().getFullYear(),
          // Datos adicionales
          campus_name: "Campus Principal", // Por ahora, ya que no hay relación directa
          _original: group,
        }
      }) || []

    console.log(`✅ Successfully formatted ${formattedGroups.length} groups`)

    return NextResponse.json({
      success: true,
      groups: formattedGroups,
      metadata: {
        totalGroups: formattedGroups.length,
        structure: "composite_key",
        primaryKey: ["number", "subject_code", "semester"],
        tablesAccessed: {
          groups: !!groups,
          subjects: !!subjects,
          employees: !!employees,
          campuses: !!campuses,
        },
      },
    })
  } catch (error) {
    console.error("Unexpected error in groups API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
