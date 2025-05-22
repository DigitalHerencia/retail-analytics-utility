export interface BusinessData {
  id: string
  wholesalePricePerOz: number
  targetProfitPerMonth: number
  operatingExpenses: number
  createdAt: Date
  updatedAt: Date
}

export interface Salesperson {
  id: string
  scenarioId: string
  name: string
  commissionRate: number
  salesQuantity: number
  createdAt: Date
  updatedAt: Date
}

export interface ScenarioData {
  id: string
  scenario: string
  retailPriceG: number
  grossMarginG: number
  netProfit: number
  qtyMonthG: number
  qtyMonthOz: number
  monthlyRevenue: number
  monthlyCost: number
  totalCommission: number
  netProfitAfterCommission: number
  salespeople?: Salesperson[]
}

export interface InventoryItem {
  id: string
  name: string
  description: string | null
  quantityG: number
  quantityOz: number
  quantityKg: number
  purchaseDate: string
  costPerOz: number
  totalCost: number
  reorderThresholdG: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Payment {
  id: string
  amount: number
  date: string
  method: string
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
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  date: string
  type: string
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
  createdAt?: string
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  description: string
  createdAt: string
  updatedAt: string
}

export interface PricePoint {
  id: string
  markupPercentage: number
  retailPricePerGram: number
  profitPerGram: number
  breakEvenGramsPerMonth: number
  breakEvenOuncesPerMonth: number
  monthlyRevenue: number
  monthlyCost: number
  monthlyProfit: number
  roi: number
}

// Default markup percentages for pricing calculations
export const defaultMarkupPercentages = [50, 75, 100, 125, 150]

export const defaultBusinessData: BusinessData = {
  id: "default",
  wholesalePricePerOz: 100,
  targetProfitPerMonth: 2000,
  operatingExpenses: 500,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Sample inventory data for initialization and testing
export const sampleInventory: InventoryItem[] = [
  {
    id: "inv1",
    name: "Premium",
    description: "Top shelf product",
    quantityG: 100,
    quantityOz: 3.53,
    quantityKg: 0.1,
    purchaseDate: "2024-01-01",
    costPerOz: 80.0,
    totalCost: 282.4,
    reorderThresholdG: 20,
  },
  {
    id: "inv2",
    name: "Standard",
    description: "Mid-grade product",
    quantityG: 200,
    quantityOz: 7.05,
    quantityKg: 0.2,
    purchaseDate: "2024-01-05",
    costPerOz: 50.0,
    totalCost: 352.5,
    reorderThresholdG: 50,
  },
]

// Sample customer data for initialization and testing
export const sampleCustomers: Customer[] = [
  {
    id: "cust1",
    name: "John Doe",
    phone: "555-123-4567",
    email: "john.doe@example.com",
    address: "123 Main St",
    amountOwed: 100.0,
    dueDate: "2024-02-15",
    status: "unpaid",
    paymentHistory: [],
    notes: "Regular customer",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "cust2",
    name: "Jane Smith",
    phone: "555-987-6543",
    email: "jane.smith@example.com",
    address: "456 Elm St",
    amountOwed: 0.0,
    dueDate: "2024-02-20",
    status: "paid",
    paymentHistory: [],
    notes: "New customer",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
]
