import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectToMongoDB()
    const grades = await db.collection("student_grades").findOne({
      studentId: session.user.id,
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
