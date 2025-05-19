import { getMongoDb } from "@/lib/mongodb/client"
import type { EvaluationPlan, Activity } from "@/models/mongodb/types"
import { ObjectId } from "mongodb"

export async function createEvaluationPlan(evaluationPlan: Omit<EvaluationPlan, "_id">): Promise<string> {
  const db = await getMongoDb()
  const collection = db.collection("evaluation_plans")

  // Validar que el total de porcentajes sea 100
  const totalPercentage = evaluationPlan.activities.reduce((sum, activity) => sum + activity.percentage, 0)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error("El total de porcentajes debe ser 100%")
  }

  const result = await collection.insertOne({
    ...evaluationPlan,
    created_at: new Date(),
    updated_at: new Date(),
    total_percentage: totalPercentage,
  })

  return result.insertedId.toString()
}

export async function getEvaluationPlanById(id: string): Promise<EvaluationPlan | null> {
  const db = await getMongoDb()
  const collection = db.collection("evaluation_plans")

  const plan = await collection.findOne({ _id: new ObjectId(id) })

  return plan as EvaluationPlan | null
}

export async function getEvaluationPlansByGroup(
  subjectCode: string,
  groupNumber: number,
  semester: string,
): Promise<EvaluationPlan[]> {
  const db = await getMongoDb()
  const collection = db.collection("evaluation_plans")

  const plans = await collection
    .find({
      "group_ref.subject_code": subjectCode,
      "group_ref.group_number": groupNumber,
      "group_ref.semester": semester,
    })
    .toArray()

  return plans as EvaluationPlan[]
}

export async function updateEvaluationPlan(id: string, activities: Activity[]): Promise<boolean> {
  const db = await getMongoDb()
  const collection = db.collection("evaluation_plans")

  // Validar que el total de porcentajes sea 100
  const totalPercentage = activities.reduce((sum, activity) => sum + activity.percentage, 0)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error("El total de porcentajes debe ser 100%")
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        activities,
        total_percentage: totalPercentage,
        updated_at: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

export async function deleteEvaluationPlan(id: string): Promise<boolean> {
  const db = await getMongoDb()
  const collection = db.collection("evaluation_plans")

  const result = await collection.deleteOne({ _id: new ObjectId(id) })

  return result.deletedCount > 0
}
