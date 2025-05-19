// Tipos para las entidades de MongoDB
import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password_hash: string
  full_name: string
  university_student_id?: string
  registration_date: Date
  last_login?: Date
}

export interface Activity {
  activity_id: ObjectId
  name: string
  percentage: number
}

export interface EvaluationPlan {
  _id?: ObjectId
  creator_user_id: ObjectId
  group_ref: {
    subject_code: string
    group_number: number
    semester: string
  }
  professor_id_ref?: string
  plan_name: string
  activities: Activity[]
  total_percentage: number
  created_at: Date
  updated_at: Date
}

export interface GradeDetail {
  activity_id: ObjectId
  activity_name: string
  score: number
}

export interface StudentGrade {
  _id?: ObjectId
  student_user_id: ObjectId
  evaluation_plan_id: ObjectId
  grades_details: GradeDetail[]
  semester_ref: string
  last_updated: Date
}

export interface Comment {
  _id?: ObjectId
  evaluation_plan_id: ObjectId
  commenter_user_id: ObjectId
  text: string
  created_at: Date
}
