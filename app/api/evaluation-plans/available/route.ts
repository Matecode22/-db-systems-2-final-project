import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching available evaluation plans...")

    // Obtener grupos con información completa
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .order("semester", { ascending: false })
      .order("number")

    if (groupsError) {
      throw groupsError
    }

    // Obtener materias
    const { data: subjects, error: subjectsError } = await supabase.from("subjects").select("*")

    if (subjectsError) {
      throw subjectsError
    }

    // Obtener empleados
    const { data: employees, error: employeesError } = await supabase.from("employees").select("*")

    if (employeesError) {
      throw employeesError
    }

    // Combinar datos
    const availablePlans =
      groups?.map((group) => {
        const subject = subjects?.find((s) => s.code === group.subject_code)
        const professor = employees?.find((e) => e.id === group.professor_id)

        return {
          id: `${group.number}-${group.subject_code}-${group.semester}`,
          groupNumber: group.number,
          semester: group.semester,
          subjectCode: group.subject_code,
          subjectName: subject?.name || "Materia Desconocida",
          professorId: group.professor_id,
          professorName: professor ? `${professor.first_name} ${professor.last_name}`.trim() : "Profesor Desconocido",
          year: Number.parseInt(group.semester.split("-")[0]) || new Date().getFullYear(),
          displayName: `${subject?.name || "Materia"} - Grupo ${group.number} (${group.semester})`,
          fullInfo: `${subject?.name || "Materia"} - Grupo ${group.number} - Prof. ${professor ? `${professor.first_name} ${professor.last_name}`.trim() : "Desconocido"} - ${group.semester}`,
        }
      }) || []

    console.log(`✅ Found ${availablePlans.length} available plans`)

    return NextResponse.json(availablePlans)
  } catch (error) {
    console.error("Error fetching available plans:", error)
    return NextResponse.json(
      {
        error: "Error fetching available plans",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
