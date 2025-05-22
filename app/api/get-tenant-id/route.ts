import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import sql from "@/lib/db/db"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const result = await sql`
      SELECT tenant_id FROM users WHERE clerk_id = ${userId}
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ tenantId: result[0].tenant_id })
  } catch (error) {
    console.error("Error getting tenant ID:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}