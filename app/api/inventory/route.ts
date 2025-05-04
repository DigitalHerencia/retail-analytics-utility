import { NextRequest } from "next/server"
import { InventoryItem } from "@/types"

// In-memory store for demonstration (replace with DB in production)
let inventory: InventoryItem[] = []

export async function GET() {
  return Response.json(inventory)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Basic validation
    if (!data.name || typeof data.quantityG !== "number") {
      return Response.json({ error: "Invalid inventory item" }, { status: 400 })
    }
    const item: InventoryItem = {
      ...data,
      id: data.id || `inv-${Date.now()}`,
      tenantId: data.tenantId || "default",
      quantityOz: data.quantityG / 28.35,
      quantityKg: data.quantityG / 1000,
      purchaseDate: data.purchaseDate || new Date().toISOString(),
      costPerOz: data.costPerOz || 0,
      totalCost: data.totalCost || 0,
      reorderThresholdG: data.reorderThresholdG || 0,
      retailPrice: data.retailPrice || 0,
    }
    // Upsert logic
    const idx = inventory.findIndex(i => i.id === item.id)
    if (idx > -1) {
      inventory[idx] = item
    } else {
      inventory.push(item)
    }
    return Response.json(item)
  } catch (e) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}
