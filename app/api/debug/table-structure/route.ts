import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tableName = searchParams.get("table") || "groups"

  try {
    // Intentar obtener un registro para ver la estructura
    const { data, error } = await supabase.from(tableName).select("*").limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        table: tableName,
      })
    }

    const structure = data && data.length > 0 ? Object.keys(data[0]) : []

    return NextResponse.json({
      success: true,
      table: tableName,
      columns: structure,
      sampleData: data?.[0] || null,
      recordCount: data?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      table: tableName,
    })
  }
}
