import { NextRequest } from "next/server"

// This API route is for demonstration only and uses in-memory data. Remove this file in production.
// All customer CRUD should be handled via server actions in lib/actions/customers.ts.

export async function GET() {
  return Response.json({ error: "Not implemented. Use server actions for customer data." }, { status: 501 })
}

export async function POST() {
  return Response.json({ error: "Not implemented. Use server actions for customer data." }, { status: 501 })
}
