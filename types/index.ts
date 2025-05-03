export interface BusinessData {
  targetProfit: any
  wholesalePricePerOz: number
  targetProfitPerMonth: number
  operatingExpenses: number
}

export interface PricePoint {
  id: string
  markupPercentage: number
  wholesalePricePerGram: number
  retailPricePerGram: number
  profitPerGram: number
  breakEvenGramsPerMonth: number
  breakEvenOuncesPerMonth: number
  monthlyRevenue: number
  monthlyCost: number
  monthlyProfit: number
  roi: number
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  quantityG: number
  quantityOz: number
  quantityKg: number
  purchaseDate: string
  costPerOz: number
  totalCost: number
  reorderThresholdG: number
  initialQuantityOz?: number
}

export interface Payment {
  id: string
  amount: number
  date: string
  method: string
  notes?: string
  createdAt: string
}

export interface Transaction {
  id: string
  date: string
  type: "sale" | "payment" | "purchase"
  inventoryId: string | null
  inventoryName: string | null
  quantityGrams: number
  pricePerGram: number
  totalPrice: number
  cost: number
  profit: number
  paymentMethod: string
  customerId: string | null
  customerName: string | null
  notes: string
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  amountOwed: number
  dueDate: string
  status: "paid" | "unpaid" | "partial"
  paymentHistory: Payment[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  name: string
  balance: number
  type: "asset" | "liability" | "income" | "expense"
  description: string
  createdAt: string
  updatedAt: string
}

export interface Salesperson {
  id: string;
  name: string;
  target: number;
  achieved: number;
  commissionRate: number;
  earnings?: number;
}

export interface ScenarioData {
  id: string
  scenario: string
  retailPriceG: number
  grossMarginG: number
  monthlyRevenue: number
  monthlyCost: number
  netProfitAfterCommission: number
  totalCommission: number
  salespeople: Salesperson[]
  breakEvenGramsPerMonth: number
  breakEvenOuncesPerMonth: number
  profitPerGram: number
  wholesalePricePerGram: number
  retailPricePerGram: number
  netProfit: number
  cogs: number
  unitsNeeded: number
  totalRevenue: number
}
