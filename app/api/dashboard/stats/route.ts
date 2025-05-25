import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectToMongoDB()

    // Obtener todas las notas del estudiante
    const studentGrades = await db
      .collection("student_grades")
      .find({
        studentId: session.user.id,
      })
      .toArray()

    // Obtener todos los planes de evaluación
    const evaluationPlans = await db.collection("evaluation_plans").find({}).toArray()

    // Calcular estadísticas
    const totalSubjects = studentGrades.length
    let totalWeightedGrade = 0
    let totalWeight = 0
    let completedActivities = 0
    let totalActivities = 0

    for (const gradeRecord of studentGrades) {
      const plan = evaluationPlans.find((p) => p._id.toString() === gradeRecord.evaluationPlanId)
      if (!plan) continue

      for (const activity of plan.activities) {
        totalActivities++
        const grade = gradeRecord.grades.find((g: any) => g.activityId === activity.id)

        if (grade && grade.grade > 0) {
          completedActivities++
          const normalizedGrade = (grade.grade / activity.maxGrade) * 100
          totalWeightedGrade += normalizedGrade * (activity.percentage / 100)
          totalWeight += activity.percentage / 100
        }
      }
    }

    const averageGrade = totalWeight > 0 ? totalWeightedGrade / totalWeight : 0
    const pendingActivities = totalActivities - completedActivities

    return NextResponse.json({
      totalSubjects,
      averageGrade,
      completedActivities,
      pendingActivities,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
