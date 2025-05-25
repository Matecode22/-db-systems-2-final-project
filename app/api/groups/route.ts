import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching groups from Supabase...")

    // Primero, intentar obtener la estructura de la tabla groups
    const { data: groupsStructure, error: structureError } = await supabase.from("groups").select("*").limit(1)

    if (structureError) {
      console.error("Error checking groups structure:", structureError)
      return NextResponse.json(
        {
          error: "Error accessing groups table",
          details: structureError.message,
          suggestion: "Verifica que la tabla 'groups' existe en Supabase",
        },
        { status: 500 },
      )
    }

    // Detectar las columnas disponibles
    const availableColumns = groupsStructure && groupsStructure.length > 0 ? Object.keys(groupsStructure[0]) : []
    console.log("📋 Available columns in groups table:", availableColumns)

    // Mapear nombres de columnas comunes
    const columnMapping = {
      id: availableColumns.find((col) => col.toLowerCase().includes("id") && !col.includes("_")) || availableColumns[0],
      subject_id: availableColumns.find((col) => col.toLowerCase().includes("subject")) || "subject_id",
      employee_id: availableColumns.find((col) => col.toLowerCase().includes("employee")) || "employee_id",
      campus_id: availableColumns.find((col) => col.toLowerCase().includes("campus")) || "campus_id",
      group_number: availableColumns.find((col) => col.toLowerCase().includes("group")) || "group_number",
      semester: availableColumns.find((col) => col.toLowerCase().includes("semester")) || "semester",
      year: availableColumns.find((col) => col.toLowerCase().includes("year")) || "year",
    }

    console.log("🗺️ Column mapping:", columnMapping)

    // Obtener todos los grupos usando las columnas detectadas
    const { data: groups, error: groupsError } = await supabase.from("groups").select("*").order(columnMapping.id)

    if (groupsError) {
      console.error("Error fetching groups:", groupsError)
      return NextResponse.json(
        {
          error: "Error fetching groups",
          details: groupsError.message,
          availableColumns,
        },
        { status: 500 },
      )
    }

    console.log(`📊 Found ${groups?.length || 0} groups`)

    // Obtener materias
    const { data: subjects, error: subjectsError } = await supabase.from("subjects").select("*")

    if (subjectsError) {
      console.warn("Error fetching subjects:", subjectsError.message)
    }

    // Obtener empleados
    const { data: employees, error: employeesError } = await supabase.from("employees").select("*")

    if (employeesError) {
      console.warn("Error fetching employees:", employeesError.message)
    }

    // Obtener campus
    const { data: campuses, error: campusesError } = await supabase.from("campuses").select("*")

    if (campusesError) {
      console.warn("Error fetching campuses:", campusesError.message)
    }

    // Formatear los datos usando el mapeo de columnas
    const formattedGroups =
      groups?.map((group) => {
        const subject = subjects?.find((s) => s.id === group[columnMapping.subject_id])
        const employee = employees?.find((e) => e.id === group[columnMapping.employee_id])
        const campus = campuses?.find((c) => c.id === group[columnMapping.campus_id])

        return {
          id: group[columnMapping.id],
          subject_id: group[columnMapping.subject_id],
          group_number: group[columnMapping.group_number] || "N/A",
          semester: group[columnMapping.semester] || "N/A",
          year: group[columnMapping.year] || new Date().getFullYear(),
          employee_id: group[columnMapping.employee_id],
          campus_id: group[columnMapping.campus_id],
          subject_name: subject?.name || "Materia Desconocida",
          subject_code: subject?.code || "N/A",
          professor_name: employee
            ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
            : "Profesor Desconocido",
          campus_name: campus?.name || "Campus Desconocido",
          // Incluir datos originales para debug
          _original: group,
          _columns: availableColumns,
        }
      }) || []

    console.log(`✅ Successfully formatted ${formattedGroups.length} groups`)

    return NextResponse.json({
      success: true,
      groups: formattedGroups,
      metadata: {
        totalGroups: formattedGroups.length,
        availableColumns,
        columnMapping,
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
