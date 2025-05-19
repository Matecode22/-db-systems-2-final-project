import { getMongoDb } from "@/lib/mongodb/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await getMongoDb()

    // Listar todas las colecciones en la base de datos
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Verificar si las colecciones necesarias existen
    const requiredCollections = ["evaluation_plans", "student_grades", "comments", "users"]
    const missingCollections = requiredCollections.filter((c) => !collectionNames.includes(c))

    return NextResponse.json({
      success: true,
      message: "Conexión a MongoDB establecida correctamente",
      databaseName: db.databaseName,
      collections: collectionNames,
      missingCollections:
        missingCollections.length > 0 ? missingCollections : "Todas las colecciones requeridas existen",
    })
  } catch (error: any) {
    console.error("Error al conectar a MongoDB:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
