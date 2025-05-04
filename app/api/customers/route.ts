import { NextRequest } from "next/server"
import { Customer } from "@/types"

// In-memory store for demonstration (replace with DB in production)
let customers: Customer[] = []

export async function GET() {
  return Response.json(customers)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Basic validation
    if (!data.name || typeof data.amountOwed !== "number") {
      return Response.json({ error: "Invalid customer" }, { status: 400 })
    }
    const customer: Customer = {
      ...data,
      id: data.id || `cust-${Date.now()}`,
      tenantId: data.tenantId || "default",
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      dueDate: data.dueDate || new Date().toISOString(),
      status: data.status || "unpaid",
      paymentHistory: data.paymentHistory || [],
      notes: data.notes || "",
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // Upsert logic
    const idx = customers.findIndex(c => c.id === customer.id)
    if (idx > -1) {
      customers[idx] = customer
    } else {
      customers.push(customer)
    }
    return Response.json(customer)
  } catch (e) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}
