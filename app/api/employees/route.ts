import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: employees, error } = await supabase
      .from("employees")
      .select(`
        *,
        employee_types!inner (
          id,
          name
        )
      `)
      .order("last_name")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    const formattedEmployees =
      employees?.map((employee) => ({
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        full_name: `${employee.first_name} ${employee.last_name}`,
        employee_type: employee.employee_types?.name || "Tipo Desconocido",
      })) || []

    console.log(`✅ Found ${formattedEmployees.length} employees from Supabase`)
    return NextResponse.json(formattedEmployees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
