import { NextRequest } from "next/server"
import { Transaction } from "@/types"

// This API route is for demonstration only and uses in-memory data. Remove this file in production.
// All transaction CRUD should be handled via server actions in lib/actions/transactions.ts.

export async function GET() {
  return Response.json({ error: "Not implemented. Use server actions for transaction data." }, { status: 501 })
}

export async function POST() {
  return Response.json({ error: "Not implemented. Use server actions for transaction data." }, { status: 501 })
}
