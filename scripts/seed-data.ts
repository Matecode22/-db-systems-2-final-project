import { connectToMongoDB } from "@/lib/mongodb"
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

// Datos de ejemplo para Supabase (estructura universitaria)
const sampleUniversityData = {
  countries: [{ id: 1, name: "Colombia" }],
  cities: [
    { id: 1, name: "Bogotá", country_id: 1 },
    { id: 2, name: "Medellín", country_id: 1 },
    { id: 3, name: "Cali", country_id: 1 },
  ],
  campuses: [
    { id: 1, name: "Campus Principal", city_id: 1, address: "Calle 123 #45-67" },
    { id: 2, name: "Campus Norte", city_id: 2, address: "Carrera 80 #30-20" },
  ],
  faculties: [
    { id: 1, name: "Facultad de Ingeniería", campus_id: 1 },
    { id: 2, name: "Facultad de Ciencias", campus_id: 1 },
  ],
  employee_types: [
    { id: 1, name: "Profesor Titular" },
    { id: 2, name: "Profesor Asociado" },
    { id: 3, name: "Profesor Asistente" },
  ],
  employees: [
    {
      id: 1,
      first_name: "Mónica",
      last_name: "Rojas",
      email: "monica.rojas@universidad.edu.co",
      employee_type_id: 1,
    },
    {
      id: 2,
      first_name: "Carlos",
      last_name: "Mendoza",
      email: "carlos.mendoza@universidad.edu.co",
      employee_type_id: 2,
    },
    {
      id: 3,
      first_name: "Ana",
      last_name: "García",
      email: "ana.garcia@universidad.edu.co",
      employee_type_id: 1,
    },
  ],
  subjects: [
    {
      id: 1,
      name: "Bases de Datos",
      code: "BD001",
      credits: 3,
      faculty_id: 1,
    },
    {
      id: 2,
      name: "Programación Orientada a Objetos",
      code: "POO001",
      credits: 4,
      faculty_id: 1,
    },
    {
      id: 3,
      name: "Cálculo Diferencial",
      code: "CAL001",
      credits: 4,
      faculty_id: 2,
    },
    {
      id: 4,
      name: "Estructuras de Datos",
      code: "ED001",
      credits: 3,
      faculty_id: 1,
    },
  ],
  groups: [
    {
      id: 1,
      subject_id: 1,
      group_number: "G1",
      semester: "2024-1",
      year: 2024,
      employee_id: 1,
      campus_id: 1,
    },
    {
      id: 2,
      subject_id: 2,
      group_number: "G1",
      semester: "2024-1",
      year: 2024,
      employee_id: 2,
      campus_id: 1,
    },
    {
      id: 3,
      subject_id: 3,
      group_number: "G2",
      semester: "2024-1",
      year: 2024,
      employee_id: 3,
      campus_id: 1,
    },
    {
      id: 4,
      subject_id: 4,
      group_number: "G1",
      semester: "2024-2",
      year: 2024,
      employee_id: 2,
      campus_id: 1,
    },
  ],
}

// Datos de ejemplo para MongoDB (aplicación)
const sampleAppData = {
  users: [
    {
      name: "Juan Pérez",
      email: "juan.perez@estudiante.edu.co",
      password: "123456", // Se hasheará
    },
    {
      name: "María González",
      email: "maria.gonzalez@estudiante.edu.co",
      password: "123456", // Se hasheará
    },
  ],
  evaluationPlans: [
    {
      groupId: 1,
      subjectName: "Bases de Datos",
      professorName: "Mónica Rojas",
      semester: "2024-1",
      year: 2024,
      activities: [
        { id: "1", name: "Primera evaluación", percentage: 10, maxGrade: 5 },
        { id: "2", name: "Segunda evaluación", percentage: 20, maxGrade: 5 },
        { id: "3", name: "Tercera evaluación", percentage: 20, maxGrade: 5 },
        { id: "4", name: "Primer entrega proyecto", percentage: 10, maxGrade: 5 },
        { id: "5", name: "Quiz MER", percentage: 10, maxGrade: 5 },
        { id: "6", name: "Segunda entrega proyecto", percentage: 10, maxGrade: 5 },
        { id: "7", name: "Tercera entrega proyecto", percentage: 10, maxGrade: 5 },
        { id: "8", name: "Quiz SQL", percentage: 10, maxGrade: 5 },
      ],
      createdBy: "user1",
      createdAt: new Date(),
      comments: [
        {
          id: "comment1",
          userId: "user2",
          userName: "María González",
          text: "Excelente plan de evaluación, muy balanceado",
          date: new Date(),
        },
      ],
    },
    {
      groupId: 2,
      subjectName: "Programación Orientada a Objetos",
      professorName: "Carlos Mendoza",
      semester: "2024-1",
      year: 2024,
      activities: [
        { id: "9", name: "Parcial 1", percentage: 25, maxGrade: 5 },
        { id: "10", name: "Parcial 2", percentage: 25, maxGrade: 5 },
        { id: "11", name: "Proyecto Final", percentage: 30, maxGrade: 5 },
        { id: "12", name: "Talleres", percentage: 20, maxGrade: 5 },
      ],
      createdBy: "user1",
      createdAt: new Date(),
      comments: [],
    },
  ],
}

export async function seedDatabase() {
  try {
    console.log("🌱 Iniciando población de base de datos...")

    // Poblar Supabase con datos universitarios
    console.log("📊 Poblando Supabase...")

    // Insertar países
    for (const country of sampleUniversityData.countries) {
      await supabaseAdmin.from("countries").upsert(country)
    }

    // Insertar ciudades
    for (const city of sampleUniversityData.cities) {
      await supabaseAdmin.from("cities").upsert(city)
    }

    // Insertar campus
    for (const campus of sampleUniversityData.campuses) {
      await supabaseAdmin.from("campuses").upsert(campus)
    }

    // Insertar facultades
    for (const faculty of sampleUniversityData.faculties) {
      await supabaseAdmin.from("faculties").upsert(faculty)
    }

    // Insertar tipos de empleado
    for (const empType of sampleUniversityData.employee_types) {
      await supabaseAdmin.from("employee_types").upsert(empType)
    }

    // Insertar empleados
    for (const employee of sampleUniversityData.employees) {
      await supabaseAdmin.from("employees").upsert(employee)
    }

    // Insertar materias
    for (const subject of sampleUniversityData.subjects) {
      await supabaseAdmin.from("subjects").upsert(subject)
    }

    // Insertar grupos
    for (const group of sampleUniversityData.groups) {
      await supabaseAdmin.from("groups").upsert(group)
    }

    // Poblar MongoDB con datos de la aplicación
    console.log("🍃 Poblando MongoDB...")
    const db = await connectToMongoDB()

    // Limpiar colecciones existentes
    await db.collection("users").deleteMany({})
    await db.collection("evaluation_plans").deleteMany({})
    await db.collection("student_grades").deleteMany({})

    // Insertar usuarios
    for (const user of sampleAppData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 12)
      await db.collection("users").insertOne({
        ...user,
        password: hashedPassword,
        createdAt: new Date(),
      })
    }

    // Insertar planes de evaluación
    for (const plan of sampleAppData.evaluationPlans) {
      await db.collection("evaluation_plans").insertOne(plan)
    }

    console.log("✅ Base de datos poblada exitosamente!")
    console.log("👤 Usuarios de prueba:")
    console.log("   - juan.perez@estudiante.edu.co / 123456")
    console.log("   - maria.gonzalez@estudiante.edu.co / 123456")
  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
