import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb-simple"
import { getLocalDatabase } from "@/lib/mongodb-fallback"

export async function GET() {
  try {
    // Intentar MongoDB primero
    const db = await connectToMongoDB()

    if (db) {
      const plans = await db.collection("evaluation_plans").find({}).toArray()
      return NextResponse.json(plans)
    }

    // Fallback a base de datos local
    console.log("Using local database fallback for evaluation plans")
    const localDb = getLocalDatabase()
    const plans = await localDb.collection("evaluation_plans").find({}).toArray()
    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching evaluation plans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { groupId, subjectName, professorName, semester, year, activities } = body

    const plan = {
      groupId,
      subjectName,
      professorName,
      semester,
      year,
      activities,
      createdBy: session.user.id,
      createdAt: new Date(),
      comments: [],
    }

    // Intentar MongoDB primero
    const db = await connectToMongoDB()

    if (db) {
      const result = await db.collection("evaluation_plans").insertOne(plan)
      return NextResponse.json({ id: result.insertedId })
    }

    // Fallback a base de datos local
    console.log("Using local database fallback for creating plan")
    const localDb = getLocalDatabase()
    const result = await localDb.collection("evaluation_plans").insertOne(plan)
    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error("Error creating evaluation plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
