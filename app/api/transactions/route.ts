import { NextRequest } from "next/server"
import { Transaction } from "@/types"

// In-memory store for demonstration (replace with DB in production)
let transactions: Transaction[] = []

export async function GET() {
  return Response.json(transactions)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Basic validation
    if (!data.type || typeof data.totalPrice !== "number") {
      return Response.json({ error: "Invalid transaction" }, { status: 400 })
    }
    const transaction: Transaction = {
      ...data,
      id: data.id || `txn-${Date.now()}`,
      tenantId: data.tenantId || "default",
      date: data.date || new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      inventoryId: data.inventoryId || null,
      inventoryName: data.inventoryName || null,
      customerId: data.customerId || null,
      customerName: data.customerName || null,
      notes: data.notes || "",
      cost: data.cost || 0,
      profit: data.profit || 0,
      paymentMethod: data.paymentMethod || "cash",
      quantityGrams: data.quantityGrams || 0,
      pricePerGram: data.pricePerGram || 0,
    }
    transactions.push(transaction)
    return Response.json(transaction)
  } catch (e) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}
