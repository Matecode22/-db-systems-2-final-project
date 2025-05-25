import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb-simple"
import { getLocalDatabase } from "@/lib/mongodb-fallback"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener datos de MongoDB o fallback local
    let studentGrades = []
    let evaluationPlans = []

    try {
      const db = await connectToMongoDB()
      if (db) {
        studentGrades = await db.collection("student_grades").find({ studentId: session.user.id }).toArray()
        evaluationPlans = await db.collection("evaluation_plans").find({}).toArray()
      } else {
        throw new Error("MongoDB not available")
      }
    } catch (error) {
      console.log("Using local database for reports")
      const localDb = getLocalDatabase()
      studentGrades = await localDb.collection("student_grades").find({ studentId: session.user.id }).toArray()
      evaluationPlans = await localDb.collection("evaluation_plans").find({}).toArray()
    }

    // Obtener información adicional de Supabase
    const { data: groups } = await supabase.from("groups").select(`
        *,
        subjects (name, code),
        employees (first_name, last_name)
      `)

    const subjectReports = []
    const semesterMap = new Map()

    for (const gradeRecord of studentGrades) {
      const plan = evaluationPlans.find((p) => p._id.toString() === gradeRecord.evaluationPlanId)
      if (!plan) continue

      // Buscar información adicional del grupo en Supabase
      const groupInfo = groups?.find((g) => g.id === plan.groupId)

      let totalWeightedGrade = 0
      let totalWeight = 0
      let completedActivities = 0
      const activities = []

      for (const activity of plan.activities) {
        const grade = gradeRecord.grades.find((g: any) => g.activityId === activity.id)
        const currentGrade = grade ? grade.grade : 0
        const status = currentGrade > 0 ? "completed" : "pending"

        activities.push({
          name: activity.name,
          percentage: activity.percentage,
          maxGrade: activity.maxGrade,
          currentGrade,
          status,
        })

        if (currentGrade > 0) {
          completedActivities++
          const normalizedGrade = (currentGrade / activity.maxGrade) * 100
          totalWeightedGrade += normalizedGrade * (activity.percentage / 100)
          totalWeight += activity.percentage / 100
        }
      }

      const currentGrade = totalWeight > 0 ? totalWeightedGrade / totalWeight : 0
      const projectedGrade = totalWeightedGrade

      const subjectReport = {
        subjectName: plan.subjectName || groupInfo?.subjects?.name || "Materia Desconocida",
        professorName:
          plan.professorName ||
          (groupInfo?.employees
            ? `${groupInfo.employees.first_name} ${groupInfo.employees.last_name}`
            : "Profesor Desconocido"),
        semester: plan.semester,
        year: plan.year,
        currentGrade,
        projectedGrade,
        completedActivities,
        totalActivities: plan.activities.length,
        activities,
      }

      subjectReports.push(subjectReport)

      // Agregar a estadísticas por semestre
      const semesterKey = `${plan.semester}-${plan.year}`
      if (!semesterMap.has(semesterKey)) {
        semesterMap.set(semesterKey, {
          semester: plan.semester,
          year: plan.year,
          subjects: [],
          totalGrades: 0,
          gradeSum: 0,
        })
      }

      const semesterData = semesterMap.get(semesterKey)
      semesterData.subjects.push(subjectReport)
      if (currentGrade > 0) {
        semesterData.totalGrades++
        semesterData.gradeSum += currentGrade
      }
    }

    // Calcular estadísticas por semestre
    const semesterStats = Array.from(semesterMap.values()).map((data) => {
      const averageGrade = data.totalGrades > 0 ? data.gradeSum / data.totalGrades : 0
      const grades = data.subjects.map((s: any) => s.currentGrade).filter((g: number) => g > 0)
      const highestGrade = grades.length > 0 ? Math.max(...grades) : 0
      const lowestGrade = grades.length > 0 ? Math.min(...grades) : 0
      const completedSubjects = data.subjects.filter((s: any) => s.completedActivities === s.totalActivities).length

      return {
        semester: data.semester,
        year: data.year,
        averageGrade,
        totalSubjects: data.subjects.length,
        completedSubjects,
        highestGrade,
        lowestGrade,
      }
    })

    // Ordenar por año y semestre más reciente
    semesterStats.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.semester.localeCompare(a.semester)
    })

    console.log(`✅ Generated reports for ${subjectReports.length} subjects`)
    return NextResponse.json({
      subjectReports,
      semesterStats,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
