import { getMongoDb } from "@/lib/mongodb/client"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const db = await getMongoDb()

    // Lista de colecciones a crear si no existen
    const requiredCollections = ["evaluation_plans", "student_grades", "comments", "users"]

    // Obtener las colecciones existentes
    const existingCollections = await db.listCollections().toArray()
    const existingCollectionNames = existingCollections.map((c) => c.name)

    // Crear las colecciones que no existen
    const createdCollections = []

    for (const collectionName of requiredCollections) {
      if (!existingCollectionNames.includes(collectionName)) {
        await db.createCollection(collectionName)
        createdCollections.push(collectionName)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Inicialización de MongoDB completada",
      createdCollections: createdCollections.length > 0 ? createdCollections : "No se crearon nuevas colecciones",
      existingCollections: existingCollectionNames,
    })
  } catch (error: any) {
    console.error("Error al inicializar MongoDB:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
