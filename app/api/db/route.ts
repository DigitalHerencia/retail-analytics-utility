import { type NextRequest, NextResponse } from "next/server"
import { query, toCamelCase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { sql, params } = await request.json()

    // Security check - prevent dangerous operations in preview
    const lowerSql = sql.toLowerCase()
    if (
      lowerSql.includes("drop") ||
      lowerSql.includes("truncate") ||
      (lowerSql.includes("delete from") && !lowerSql.includes("where"))
    ) {
      return NextResponse.json({ error: "This operation is not allowed" }, { status: 403 })
    }

    const result = await query(sql, params)
    return NextResponse.json({ data: toCamelCase(result.rows) })
  } catch (error: any) {
    console.error("API route error:", error)
    return NextResponse.json({ error: error.message || "Database operation failed" }, { status: 500 })
  }
}
