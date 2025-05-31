import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb-simple"
import { getLocalDatabase } from "@/lib/mongodb-fallback"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId } = params
    const body = await request.json()
    const { activities } = body

    // Validar que la suma de porcentajes sea 100%
    const totalPercentage = activities.reduce((sum: number, activity: any) => sum + activity.percentage, 0)
    if (totalPercentage !== 100) {
      return NextResponse.json(
        { error: "La suma de porcentajes debe ser exactamente 100%" },
        { status: 400 }
      )
    }

    const updateData = {
      activities,
      updatedAt: new Date(),
      updatedBy: (session.user as any).id,
    }

    // Intentar MongoDB primero
    const db = await connectToMongoDB()

    if (db) {
      const result = await db.collection("evaluation_plans").updateOne(
        { _id: new ObjectId(planId) },
        { $set: updateData }
      )

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ success: true, message: "Plan actualizado correctamente" })
    }

    // Fallback a base de datos local
    console.log("Using local database fallback for updating plan")
    const localDb = getLocalDatabase()
    const result = await localDb.collection("evaluation_plans").updateOne(
      { _id: planId },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Plan actualizado correctamente" })
  } catch (error) {
    console.error("Error updating evaluation plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId } = params

    // Intentar MongoDB primero
    const db = await connectToMongoDB()

    if (db) {
      const result = await db.collection("evaluation_plans").deleteOne({
        _id: new ObjectId(planId)
      })

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ success: true, message: "Plan eliminado correctamente" })
    }

    // Fallback a base de datos local
    console.log("Using local database fallback for deleting plan")
    const localDb = getLocalDatabase()
    const result = await localDb.collection("evaluation_plans").deleteMany({
      _id: planId
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Plan eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting evaluation plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 