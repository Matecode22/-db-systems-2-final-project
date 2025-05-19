import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Consultar la tabla SUBJECTS en PostgreSQL
    const { data, error } = await supabase.from("SUBJECTS").select("*")

    if (error) {
      console.error("Error fetching subjects:", error)
      return NextResponse.json({ error: "Error al obtener las asignaturas" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in subjects API:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
