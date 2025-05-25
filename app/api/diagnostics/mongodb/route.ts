import { NextResponse } from "next/server"
import { connectToMongoDB } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await connectToMongoDB()
    await db.admin().ping()

    return NextResponse.json({
      success: true,
      message: "Conexión MongoDB exitosa",
      details: "Base de datos conectada y respondiendo",
    })
  } catch (error) {
    console.error("MongoDB diagnostic error:", error)

    return NextResponse.json({
      success: false,
      message: "Error de conexión MongoDB - usando fallback local",
      details: error.message,
    })
  }
}
