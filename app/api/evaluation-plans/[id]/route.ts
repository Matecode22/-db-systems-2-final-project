import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/mongodb/client"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getMongoDb()
    const collection = db.collection("evaluation_plans")

    const plan = await collection.findOne({ _id: new ObjectId(params.id) })

    if (!plan) {
      return NextResponse.json({ error: "Plan de evaluación no encontrado" }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error: any) {
    console.error("Error fetching evaluation plan:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    if (!data.activities) {
      return NextResponse.json({ error: "Se requiere el campo activities" }, { status: 400 })
    }

    // Validar que el total de porcentajes sea 100
    const totalPercentage = data.activities.reduce((sum: number, activity: any) => sum + activity.percentage, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return NextResponse.json({ error: "El total de porcentajes debe ser 100%" }, { status: 400 })
    }

    const db = await getMongoDb()
    const collection = db.collection("evaluation_plans")

    // Convertir los IDs de string a ObjectId o crear nuevos ObjectId
    const activities = data.activities.map((activity: any) => ({
      activity_id: activity.activity_id.includes("new") ? new ObjectId() : new ObjectId(activity.activity_id),
      name: activity.name,
      percentage: activity.percentage,
    }))

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          activities,
          total_percentage: totalPercentage,
          updated_at: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Plan de evaluación no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating evaluation plan:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getMongoDb()
    const collection = db.collection("evaluation_plans")

    const result = await collection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Plan de evaluación no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting evaluation plan:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
