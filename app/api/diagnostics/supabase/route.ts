import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("subjects").select("count").limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Conexión Supabase exitosa",
      details: "Base de datos universitaria conectada",
    })
  } catch (error) {
    console.error("Supabase diagnostic error:", error)

    return NextResponse.json({
      success: false,
      message: "Error de conexión Supabase",
      details: error.message,
    })
  }
}
