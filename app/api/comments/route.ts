import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/mongodb/client"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar los datos recibidos
    if (!data.evaluation_plan_id || !data.commenter_user_id || !data.text) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const db = await getMongoDb()
    const collection = db.collection("comments")

    // Crear el comentario
    const comment = {
      evaluation_plan_id: new ObjectId(data.evaluation_plan_id),
      commenter_user_id: new ObjectId(data.commenter_user_id),
      text: data.text,
      created_at: new Date(),
    }

    const result = await collection.insertOne(comment)

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const evaluationPlanId = searchParams.get("evaluationPlanId")

    if (!evaluationPlanId) {
      return NextResponse.json({ error: "Se requiere el parámetro evaluationPlanId" }, { status: 400 })
    }

    const db = await getMongoDb()
    const collection = db.collection("comments")

    // Obtener los comentarios para el plan de evaluación
    const comments = await collection
      .find({
        evaluation_plan_id: new ObjectId(evaluationPlanId),
      })
      .sort({ created_at: 1 })
      .toArray()

    // Obtener los IDs de los usuarios que comentaron
    const userIds = comments.map((comment) => comment.commenter_user_id)

    // En una implementación real, aquí obtendrías los nombres de los usuarios
    // Para este ejemplo, simplemente agregaremos un nombre genérico
    const commentsWithUserNames = comments.map((comment) => ({
      ...comment,
      commenter_name: "Usuario " + comment.commenter_user_id.toString().substring(0, 5),
    }))

    return NextResponse.json(commentsWithUserNames)
  } catch (error: any) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
