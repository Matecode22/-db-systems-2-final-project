import { NextResponse } from "next/server"
import { seedDatabase } from "@/scripts/seed-data"

export async function POST() {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
    }

    await seedDatabase()
    return NextResponse.json({ message: "Database seeded successfully" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
