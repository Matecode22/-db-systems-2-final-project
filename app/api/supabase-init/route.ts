import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const results = []

    // Crear tabla COUNTRIES si no existe
    const { error: countriesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "COUNTRIES",
      table_definition: `
        code INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      `,
    })

    if (countriesError) results.push({ table: "COUNTRIES", status: "error", message: countriesError.message })
    else results.push({ table: "COUNTRIES", status: "success" })

    // Crear tabla DEPARTMENTS si no existe
    const { error: deptsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "DEPARTMENTS",
      table_definition: `
        code INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        country_code INTEGER REFERENCES COUNTRIES(code)
      `,
    })

    if (deptsError) results.push({ table: "DEPARTMENTS", status: "error", message: deptsError.message })
    else results.push({ table: "DEPARTMENTS", status: "success" })

    // Crear tabla CITIES si no existe
    const { error: citiesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "CITIES",
      table_definition: `
        code INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        dept_code INTEGER REFERENCES DEPARTMENTS(code)
      `,
    })

    if (citiesError) results.push({ table: "CITIES", status: "error", message: citiesError.message })
    else results.push({ table: "CITIES", status: "success" })

    // Crear tabla CAMPUSES si no existe
    const { error: campusesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "CAMPUSES",
      table_definition: `
        code INTEGER PRIMARY KEY,
        name VARCHAR(100),
        city_code INTEGER REFERENCES CITIES(code)
      `,
    })

    if (campusesError) results.push({ table: "CAMPUSES", status: "error", message: campusesError.message })
    else results.push({ table: "CAMPUSES", status: "success" })

    // Crear tabla CONTRACT_TYPES si no existe
    const { error: contractTypesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "CONTRACT_TYPES",
      table_definition: `
        name VARCHAR(50) PRIMARY KEY
      `,
    })

    if (contractTypesError)
      results.push({ table: "CONTRACT_TYPES", status: "error", message: contractTypesError.message })
    else results.push({ table: "CONTRACT_TYPES", status: "success" })

    // Crear tabla EMPLOYEE_TYPES si no existe
    const { error: employeeTypesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "EMPLOYEE_TYPES",
      table_definition: `
        name VARCHAR(50) PRIMARY KEY
      `,
    })

    if (employeeTypesError)
      results.push({ table: "EMPLOYEE_TYPES", status: "error", message: employeeTypesError.message })
    else results.push({ table: "EMPLOYEE_TYPES", status: "success" })

    // Crear tabla FACULTIES si no existe
    const { error: facultiesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "FACULTIES",
      table_definition: `
        code INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        phone_number VARCHAR(20),
        dean_id VARCHAR(20)
      `,
    })

    if (facultiesError) results.push({ table: "FACULTIES", status: "error", message: facultiesError.message })
    else results.push({ table: "FACULTIES", status: "success" })

    // Crear tabla EMPLOYEES si no existe
    const { error: employeesError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "EMPLOYEES",
      table_definition: `
        id VARCHAR(20) PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        contract_type VARCHAR(50) REFERENCES CONTRACT_TYPES(name),
        employee_type VARCHAR(50) REFERENCES EMPLOYEE_TYPES(name),
        faculty_code INTEGER REFERENCES FACULTIES(code),
        campus_code INTEGER REFERENCES CAMPUSES(code),
        birth_place_code INTEGER REFERENCES CITIES(code)
      `,
    })

    if (employeesError) results.push({ table: "EMPLOYEES", status: "error", message: employeesError.message })
    else results.push({ table: "EMPLOYEES", status: "success" })

    // Actualizar la referencia del decano en FACULTIES
    const { error: facultyUpdateError } = await supabase.rpc("execute_sql", {
      sql_statement: `
        ALTER TABLE "FACULTIES" 
        ADD CONSTRAINT fk_dean 
        FOREIGN KEY (dean_id) 
        REFERENCES "EMPLOYEES"(id)
      `,
    })

    if (facultyUpdateError && !facultyUpdateError.message.includes("already exists")) {
      results.push({ table: "FACULTIES_UPDATE", status: "error", message: facultyUpdateError.message })
    } else {
      results.push({ table: "FACULTIES_UPDATE", status: "success" })
    }

    // Crear tabla AREAS si no existe
    const { error: areasError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "AREAS",
      table_definition: `
        code INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        faculty_code INTEGER REFERENCES FACULTIES(code),
        coordinator_id VARCHAR(20) REFERENCES EMPLOYEES(id)
      `,
    })

    if (areasError) results.push({ table: "AREAS", status: "error", message: areasError.message })
    else results.push({ table: "AREAS", status: "success" })

    // Crear tabla PROGRAMS si no existe
    const { error: programsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "PROGRAMS",
      table_definition: `
        code INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        area_code INTEGER REFERENCES AREAS(code)
      `,
    })

    if (programsError) results.push({ table: "PROGRAMS", status: "error", message: programsError.message })
    else results.push({ table: "PROGRAMS", status: "success" })

    // Crear tabla SUBJECTS si no existe
    const { error: subjectsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "SUBJECTS",
      table_definition: `
        code VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        program_code INTEGER REFERENCES PROGRAMS(code)
      `,
    })

    if (subjectsError) results.push({ table: "SUBJECTS", status: "error", message: subjectsError.message })
    else results.push({ table: "SUBJECTS", status: "success" })

    // Crear tabla GROUPS si no existe
    const { error: groupsError } = await supabase.rpc("create_table_if_not_exists", {
      table_name: "GROUPS",
      table_definition: `
        number INTEGER,
        semester VARCHAR(10),
        subject_code VARCHAR(10) REFERENCES SUBJECTS(code),
        professor_id VARCHAR(20) REFERENCES EMPLOYEES(id),
        PRIMARY KEY (number, semester, subject_code)
      `,
    })

    if (groupsError) results.push({ table: "GROUPS", status: "error", message: groupsError.message })
    else results.push({ table: "GROUPS", status: "success" })

    return NextResponse.json({
      success: true,
      message: "Inicialización de tablas en Supabase completada",
      results,
    })
  } catch (error: any) {
    console.error("Error al inicializar tablas en Supabase:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
