import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { evaluationPlanId, activityId, grade, semester, year } = body

    const db = await connectToMongoDB()

    // Buscar si ya existe un registro de notas para este estudiante y plan
    const existingGrades = await db.collection("student_grades").findOne({
      studentId: session.user.id,
      evaluationPlanId,
    })

    if (existingGrades) {
      // Actualizar nota existente o agregar nueva
      const gradeIndex = existingGrades.grades.findIndex((g: any) => g.activityId === activityId)

      if (gradeIndex >= 0) {
        // Actualizar nota existente
        await db.collection("student_grades").updateOne(
          {
            studentId: session.user.id,
            evaluationPlanId,
            "grades.activityId": activityId,
          },
          {
            $set: {
              "grades.$.grade": grade,
              "grades.$.date": new Date(),
            },
          },
        )
      } else {
        // Agregar nueva nota
        await db.collection("student_grades").updateOne(
          {
            studentId: session.user.id,
            evaluationPlanId,
          },
          {
            $push: {
              grades: {
                activityId,
                grade,
                date: new Date(),
              },
            },
          },
        )
      }
    } else {
      // Crear nuevo registro de notas
      await db.collection("student_grades").insertOne({
        studentId: session.user.id,
        evaluationPlanId,
        grades: [
          {
            activityId,
            grade,
            date: new Date(),
          },
        ],
        semester,
        year,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving grade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
