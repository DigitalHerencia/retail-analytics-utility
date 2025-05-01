import { v4 as uuidv4 } from "uuid"

// Simplified data models
export interface BusinessData {
  targetProfit: any
  wholesalePricePerOz: number
  targetProfitPerMonth: number
  operatingExpenses: number
}

export interface PricePoint {
  id: string
  markupPercentage: number
  wholesalePricePerGram: number // Added this line
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
  initialQuantityOz?: number // Added initial quantity
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
  earnings?: number; // Added earnings field
}

// Redefine ScenarioData
export interface PricePoint {
  markupPercentage: number
  retailPrice: number
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
export const defaultMarkupPercentages = [50, 75, 100, 125, 150]

const ouncesToGrams = (ounces: number) => {
  return ounces * 28.3495
}

// Sample inventory
export const sampleInventory: InventoryItem[] = [
  {
    id: uuidv4(),
    name: "Premium Grade",
    description: "High quality product",
    quantityG: ouncesToGrams(5),
    quantityOz: 5,
    initialQuantityOz: 10, // Added initial quantity
    quantityKg: ouncesToGrams(5) / 1000,
    purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    costPerOz: 120,
    totalCost: 600,
    reorderThresholdG: 50,
  },
  {
    id: uuidv4(),
    name: "Standard Grade",
    description: "Regular quality product",
    quantityG: ouncesToGrams(8),
    quantityOz: 8,
    initialQuantityOz: 16, // Added initial quantity
    quantityKg: ouncesToGrams(8) / 1000,
    purchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    costPerOz: 90,
    totalCost: 720,
    reorderThresholdG: 100,
  },
]

// Sample accounts
export const sampleAccounts: Account[] = [
  {
    id: uuidv4(),
    name: "Cash on Hand",
    balance: 5000,
    type: "asset",
    description: "Physical cash available",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Bank Account",
    balance: 12000,
    type: "asset",
    description: "Main business bank account",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Accounts Receivable",
    balance: 3500,
    type: "asset",
    description: "Money owed by customers",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Supplier Credit",
    balance: 2000,
    type: "liability",
    description: "Money owed to suppliers",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Sales Revenue",
    balance: 25000,
    type: "income",
    description: "Income from sales",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Operating Expenses",
    balance: 8500,
    type: "expense",
    description: "General business expenses",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Sample customers
export const sampleCustomers: Customer[] = [
  {
    id: uuidv4(),
    name: "John Smith",
    phone: "555-123-4567",
    email: "john@example.com",
    address: "123 Main St, Anytown",
    amountOwed: 250,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "unpaid",
    paymentHistory: [],
    notes: "Regular client, always pays on time",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Jane Doe",
    phone: "555-987-6543",
    email: "jane@example.com",
    address: "456 Oak Ave, Somewhere",
    amountOwed: 0,
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "paid",
    paymentHistory: [
      {
        id: uuidv4(),
        amount: 500,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        method: "cash",
        notes: "Paid in full",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Mike Johnson",
    phone: "555-555-5555",
    email: "mike@example.com",
    address: "789 Pine St, Elsewhere",
    amountOwed: 350,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "unpaid",
    paymentHistory: [],
    notes: "New client",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    name: "Sarah Williams",
    phone: "555-222-3333",
    email: "sarah@example.com",
    address: "101 Maple Dr, Nowhere",
    amountOwed: 175,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "partial",
    paymentHistory: [
      {
        id: uuidv4(),
        amount: 125,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        method: "bank_transfer",
        notes: "First installment",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Updated Initial Scenarios
export const initialScenarios: ScenarioData[] = [
  {
    id: uuidv4(),
    scenario: "Base Case",
    retailPriceG: 15,
    grossMarginG: 10,
    monthlyRevenue: 15000,
    monthlyCost: 5000,
    netProfit: 10000, // Example value
    totalCommission: 750, // Example value, should be calculated based on salespeople
    netProfitAfterCommission: 9250, // Example value, netProfit - totalCommission
    salespeople: [
      { id: 'sp1', name: 'Alice', target: 10000, achieved: 8500, commissionRate: 0.05, earnings: 425 },
      { id: 'sp2', name: 'Bob', target: 12000, achieved: 11500, commissionRate: 0.06, earnings: 690 }, // Note: earnings calculation might be more complex
    ],
    breakEvenGramsPerMonth: 0,
    breakEvenOuncesPerMonth: 0,
    profitPerGram: 0,
    wholesalePricePerGram: 0,
    retailPricePerGram: 0,
    cogs: 0,
    unitsNeeded: 0,
    totalRevenue: 0
  },
  // Add more scenarios if needed, perhaps generated by PriceGenerator
];

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
