import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb-simple"
import { getLocalDatabase } from "@/lib/mongodb-fallback"

export async function GET(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.email // Usar email como ID del usuario

    // Usar MongoDB o fallback local
    let db
    try {
      db = await connectToMongoDB()
      if (!db) {
        throw new Error("MongoDB not available")
      }
    } catch (error) {
      console.log("Using local database for grades lookup")
      db = getLocalDatabase()
    }

    const grades = await db.collection("student_grades").findOne({
      studentId: userId,
      evaluationPlanId: params.planId,
    })

    if (!grades) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(grades)
  } catch (error) {
    console.error("Error fetching grades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
