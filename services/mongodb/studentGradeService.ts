import { getMongoDb } from "@/lib/mongodb/client"
import type { StudentGrade, GradeDetail } from "@/models/mongodb/types"
import { ObjectId } from "mongodb"

export async function saveStudentGrades(studentGrade: Omit<StudentGrade, "_id">): Promise<string> {
  const db = await getMongoDb()
  const collection = db.collection("student_grades")

  // Verificar si ya existe un registro para este estudiante y plan
  const existingGrade = await collection.findOne({
    student_user_id: studentGrade.student_user_id,
    evaluation_plan_id: studentGrade.evaluation_plan_id,
  })

  if (existingGrade) {
    // Actualizar el registro existente
    await collection.updateOne(
      { _id: existingGrade._id },
      {
        $set: {
          grades_details: studentGrade.grades_details,
          last_updated: new Date(),
        },
      },
    )
    return existingGrade._id.toString()
  } else {
    // Crear un nuevo registro
    const result = await collection.insertOne({
      ...studentGrade,
      last_updated: new Date(),
    })
    return result.insertedId.toString()
  }
}

export async function getStudentGradesByPlanId(
  studentUserId: string,
  evaluationPlanId: string,
): Promise<StudentGrade | null> {
  const db = await getMongoDb()
  const collection = db.collection("student_grades")

  const grade = await collection.findOne({
    student_user_id: new ObjectId(studentUserId),
    evaluation_plan_id: new ObjectId(evaluationPlanId),
  })

  return grade as StudentGrade | null
}

export async function getStudentGradesBySemester(studentUserId: string, semester: string): Promise<StudentGrade[]> {
  const db = await getMongoDb()
  const collection = db.collection("student_grades")

  const grades = await collection
    .find({
      student_user_id: new ObjectId(studentUserId),
      semester_ref: semester,
    })
    .toArray()

  return grades as StudentGrade[]
}

export async function updateGradeDetail(studentGradeId: string, activityId: string, score: number): Promise<boolean> {
  const db = await getMongoDb()
  const collection = db.collection("student_grades")

  const studentGrade = await collection.findOne({ _id: new ObjectId(studentGradeId) })

  if (!studentGrade) {
    return false
  }

  const updatedGradeDetails = (studentGrade.grades_details as GradeDetail[]).map((detail) => {
    if (detail.activity_id.toString() === activityId) {
      return { ...detail, score }
    }
    return detail
  })

  const result = await collection.updateOne(
    { _id: new ObjectId(studentGradeId) },
    {
      $set: {
        grades_details: updatedGradeDetails,
        last_updated: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

export async function deleteGradeDetail(studentGradeId: string, activityId: string): Promise<boolean> {
  const db = await getMongoDb()
  const collection = db.collection("student_grades")

  const studentGrade = await collection.findOne({ _id: new ObjectId(studentGradeId) })

  if (!studentGrade) {
    return false
  }

  const updatedGradeDetails = (studentGrade.grades_details as GradeDetail[]).filter(
    (detail) => detail.activity_id.toString() !== activityId,
  )

  const result = await collection.updateOne(
    { _id: new ObjectId(studentGradeId) },
    {
      $set: {
        grades_details: updatedGradeDetails,
        last_updated: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}
