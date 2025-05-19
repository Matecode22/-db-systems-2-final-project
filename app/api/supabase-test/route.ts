import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Intentar obtener la lista de tablas
    const { data, error } = await supabase.from("pg_tables").select("*").eq("schemaname", "public")

    if (error) {
      // Si no podemos acceder a pg_tables, intentemos una consulta más simple
      const { data: versionData, error: versionError } = await supabase.rpc("version")

      if (versionError) {
        throw new Error(`Error al conectar con Supabase: ${versionError.message}`)
      }

      return NextResponse.json({
        success: true,
        message: "Conexión a Supabase establecida correctamente",
        version: versionData,
        note: "No se pudieron listar las tablas, pero la conexión funciona",
      })
    }

    // Verificar si las tablas necesarias existen
    const tableNames = data.map((table: any) => table.tablename)
    const requiredTables = ["SUBJECTS", "GROUPS", "EMPLOYEES", "FACULTIES", "PROGRAMS", "AREAS"]
    const missingTables = requiredTables.filter((table) => !tableNames.includes(table))

    return NextResponse.json({
      success: true,
      message: "Conexión a Supabase establecida correctamente",
      tables: tableNames,
      missingTables: missingTables.length > 0 ? missingTables : "Todas las tablas requeridas existen",
    })
  } catch (error: any) {
    console.error("Error al conectar a Supabase:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
