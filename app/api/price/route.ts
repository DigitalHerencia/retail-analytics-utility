import { NextRequest } from "next/server"
import { PricePoint } from "@/types"

// In-memory store for demonstration (replace with DB in production)
let price: PricePoint | null = null

export async function GET() {
  if (!price) {
    return Response.json({ error: "Price not set" }, { status: 404 })
  }
  return Response.json(price)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Basic validation
    if (typeof data.value !== "number") {
      return Response.json({ error: "Invalid price value" }, { status: 400 })
    }
    price = {
      ...data,
      id: "price-1",
      markupPercentage: data.markupPercentage || 0,
      wholesalePricePerGram: data.wholesalePricePerGram || 0,
      retailPricePerGram: data.value,
      profitPerGram: data.profitPerGram || 0,
      breakEvenGramsPerMonth: data.breakEvenGramsPerMonth || 0,
      breakEvenOuncesPerMonth: data.breakEvenOuncesPerMonth || 0,
      monthlyRevenue: data.monthlyRevenue || 0,
      monthlyCost: data.monthlyCost || 0,
      monthlyProfit: data.monthlyProfit || 0,
      roi: data.roi || 0,
    }
    return Response.json(price)
  } catch (e) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}
