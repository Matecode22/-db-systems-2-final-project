import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/mongodb/client"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar los datos recibidos
    if (!data.creator_user_id || !data.group_ref || !data.plan_name || !data.activities) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Validar que el total de porcentajes sea 100
    const totalPercentage = data.activities.reduce((sum: number, activity: any) => sum + activity.percentage, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return NextResponse.json({ error: "El total de porcentajes debe ser 100%" }, { status: 400 })
    }

    const db = await getMongoDb()
    const collection = db.collection("evaluation_plans")

    // Crear el plan de evaluación
    const evaluationPlan = {
      creator_user_id: new ObjectId(data.creator_user_id),
      group_ref: data.group_ref,
      professor_id_ref: data.professor_id_ref,
      plan_name: data.plan_name,
      activities: data.activities.map((activity: any) => ({
        activity_id: new ObjectId(),
        name: activity.name,
        percentage: activity.percentage,
      })),
      total_percentage: totalPercentage,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await collection.insertOne(evaluationPlan)

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating evaluation plan:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const subjectCode = searchParams.get("subjectCode")
    const groupNumber = searchParams.get("groupNumber")
    const semester = searchParams.get("semester")

    const db = await getMongoDb()
    const collection = db.collection("evaluation_plans")

    const query: any = {}

    // Filtrar por usuario si se proporciona el ID
    if (userId) {
      query.creator_user_id = new ObjectId(userId)
    }

    // Filtrar por grupo si se proporcionan todos los parámetros
    if (subjectCode && groupNumber && semester) {
      query["group_ref.subject_code"] = subjectCode
      query["group_ref.group_number"] = Number.parseInt(groupNumber)
      query["group_ref.semester"] = semester
    }

    const plans = await collection.find(query).toArray()

    return NextResponse.json(plans)
  } catch (error: any) {
    console.error("Error fetching evaluation plans:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
