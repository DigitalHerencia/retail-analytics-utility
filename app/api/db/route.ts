import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/db/db"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { sql, params } = body

    // Basic security check - prevent dangerous operations in preview
    const sqlLower = sql.toLowerCase().trim()
    if (
      sqlLower.startsWith("drop") ||
      sqlLower.startsWith("alter") ||
      sqlLower.startsWith("truncate") ||
      sqlLower.includes("information_schema")
    ) {
      return NextResponse.json({ error: "Operation not allowed" }, { status: 403 })
    }

    // Execute the query
    const result = await query(sql, params || [])

    // Return the result
    return NextResponse.json({ data: result.rows })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
  }
}
