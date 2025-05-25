import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const results = []

  // Lista de tablas a verificar
  const tables = [
    "areas",
    "campuses",
    "cities",
    "contract_types",
    "countries",
    "departments",
    "employee_types",
    "employees",
    "faculties",
    "groups",
    "programs",
    "subjects",
  ]

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select("*", { count: "exact", head: true })

      if (error) {
        results.push({
          table,
          status: "error",
          message: error.message,
          count: 0,
        })
      } else {
        results.push({
          table,
          status: "success",
          message: "Tabla accesible",
          count: count || 0,
        })
      }
    } catch (error) {
      results.push({
        table,
        status: "error",
        message: error.message,
        count: 0,
      })
    }
  }

  // Verificar estructura específica de algunas tablas importantes
  try {
    const { data: sampleGroup } = await supabase.from("groups").select("*").limit(1).single()

    if (sampleGroup) {
      results.push({
        table: "groups_structure",
        status: "info",
        message: "Estructura de grupos",
        data: Object.keys(sampleGroup),
      })
    }
  } catch (error) {
    // Ignorar errores de estructura
  }

  return NextResponse.json({
    success: true,
    tables: results,
    summary: {
      total: tables.length,
      accessible: results.filter((r) => r.status === "success").length,
      errors: results.filter((r) => r.status === "error").length,
    },
  })
}
