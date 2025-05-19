import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/mongodb/client"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar los datos recibidos
    if (!data.student_user_id || !data.evaluation_plan_id || !data.grades_details || !data.semester_ref) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const db = await getMongoDb()
    const collection = db.collection("student_grades")

    // Verificar si ya existe un registro para este estudiante y plan
    const existingGrade = await collection.findOne({
      student_user_id: new ObjectId(data.student_user_id),
      evaluation_plan_id: new ObjectId(data.evaluation_plan_id),
    })

    let result

    if (existingGrade) {
      // Actualizar el registro existente
      result = await collection.updateOne(
        { _id: existingGrade._id },
        {
          $set: {
            grades_details: data.grades_details.map((detail: any) => ({
              activity_id: new ObjectId(detail.activity_id),
              activity_name: detail.activity_name,
              score: detail.score,
            })),
            last_updated: new Date(),
          },
        },
      )
      return NextResponse.json({ id: existingGrade._id.toString(), updated: true })
    } else {
      // Crear un nuevo registro
      const studentGrade = {
        student_user_id: new ObjectId(data.student_user_id),
        evaluation_plan_id: new ObjectId(data.evaluation_plan_id),
        grades_details: data.grades_details.map((detail: any) => ({
          activity_id: new ObjectId(detail.activity_id),
          activity_name: detail.activity_name,
          score: detail.score,
        })),
        semester_ref: data.semester_ref,
        last_updated: new Date(),
      }

      result = await collection.insertOne(studentGrade)
      return NextResponse.json({ id: result.insertedId.toString(), updated: false }, { status: 201 })
    }
  } catch (error: any) {
    console.error("Error saving student grades:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentUserId = searchParams.get("studentUserId")
    const evaluationPlanId = searchParams.get("evaluationPlanId")
    const semester = searchParams.get("semester")

    if (!studentUserId) {
      return NextResponse.json({ error: "Se requiere el parámetro studentUserId" }, { status: 400 })
    }

    const db = await getMongoDb()
    const collection = db.collection("student_grades")

    const query: any = {
      student_user_id: new ObjectId(studentUserId),
    }

    if (evaluationPlanId) {
      query.evaluation_plan_id = new ObjectId(evaluationPlanId)
      const grade = await collection.findOne(query)
      return NextResponse.json(grade || null)
    }

    if (semester) {
      query.semester_ref = semester
    }

    const grades = await collection.find(query).toArray()

    // Si se solicitan las notas por semestre, obtener los detalles de los planes de evaluación
    if (semester) {
      const plansCollection = db.collection("evaluation_plans")

      // Obtener los IDs de los planes de evaluación
      const planIds = grades.map((grade) => grade.evaluation_plan_id)

      // Obtener los planes de evaluación
      const plans = await plansCollection
        .find({
          _id: { $in: planIds },
        })
        .toArray()

      // Crear un mapa de planes para facilitar el acceso
      const plansMap = plans.reduce((map: any, plan) => {
        map[plan._id.toString()] = plan
        return map
      }, {})

      // Combinar las notas con los detalles de los planes
      const gradesWithPlanDetails = grades.map((grade) => {
        const plan = plansMap[grade.evaluation_plan_id.toString()]
        return {
          ...grade,
          plan_details: plan
            ? {
                plan_name: plan.plan_name,
                subject_code: plan.group_ref.subject_code,
                group_number: plan.group_ref.group_number,
              }
            : null,
        }
      })

      return NextResponse.json(gradesWithPlanDetails)
    }

    return NextResponse.json(grades)
  } catch (error: any) {
    console.error("Error fetching student grades:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
