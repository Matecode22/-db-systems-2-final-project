import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToMongoDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { text } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const db = await connectToMongoDB()

    const comment = {
      id: new ObjectId().toString(),
      userId: session.user.id,
      userName: session.user.name || session.user.email || "Usuario",
      text: text.trim(),
      date: new Date(),
    }

    await db
      .collection("evaluation_plans")
      .updateOne({ _id: new ObjectId(params.planId) }, { $push: { comments: comment } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
