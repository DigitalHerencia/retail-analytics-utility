import { v4 as uuidv4 } from "uuid"

// Data models
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

// Define Salesperson type
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

// Default business data
export const defaultBusinessData: BusinessData = {
  wholesalePricePerOz: 100,
  targetProfitPerMonth: 2000,
  operatingExpenses: 500,
  targetProfit: undefined,
};

// Default markup percentages
export const defaultMarkupPercentages = [50, 75, 100, 125, 150];

export const ouncesToGrams = (ounces: number) => {
  return ounces * 28.3495
}

export const gramsToOunces = (grams: number) => grams / 28.3495;
export const gramsToKg = (grams: number) => grams / 1000;

// Business concept explanations
export const businessConcepts = {
  markup:
    "Markup is the percentage you add to your cost to set your price. Higher markup means more cash in your pocket per sale, but might slow down your volume.",
  breakEven:
    "Break-even is how much product you need to move to cover your costs. After this point, you're making pure profit.",
  roi: "Return on Investment (ROI) shows how hard your money is working for you. Higher ROI means your cash is making more cash.",
  profit: "Profit is what's left after all costs are paid. This is your take-home, your real earnings.",
  wholesale:
    "Wholesale price is what you pay to get your product. Finding the right supplier with the best prices is key to maximizing profits.",
  retail:
    "Retail price is what your customers pay. Set it too high, they walk away. Set it too low, you're leaving money on the table.",
  margin:
    "Profit margin is the percentage of your selling price that's pure profit. Higher margins mean more money in your pocket per sale.",
  inventory:
    "Inventory is your product on hand. Too much ties up your cash, too little means missed sales. Balance is key.",
  cashFlow:
    "Cash flow is money moving in and out of your business. Positive flow means you're stacking paper, negative means you're bleeding cash.",
  accounts:
    "Accounts receivable is money owed to you. Stay on top of collections - in this game, respect comes from getting paid on time.",
}

// Hustle tips
export const hustleTips = [
  "Quality product commands premium prices. Don't compete on price alone.",
  "Know your best sellers and keep them stocked. Never run dry on what makes you money.",
  "Adjust your prices based on demand. When they want it more, charge more.",
  "Count all costs - product, time, risk. If you're not making money, you're wasting time.",
  "Review your prices regularly. The game changes, your prices should too.",
  "Offer bulk discounts to your best customers. Move more product, keep them loyal.",
  "Watch your competition but don't follow them. Be the leader, not the follower.",
  "Presentation matters. Premium packaging justifies premium prices.",
  "Different customers, different prices. Know who can pay more and charge accordingly.",
  "Test different price points. Find what maximizes your total profit, not just per-unit profit.",
]
