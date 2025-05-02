import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import type { PricePoint, BusinessData } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatting functions with null/undefined checks
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "$0.00"
  return `$${value.toFixed(2)}`
}

// Format grams
export const formatGrams = (grams: number | undefined | null): string => {
  if (grams === undefined || grams === null) return "0.0"
  return `${grams.toFixed(1)}`
}

// Function to calculate derived values
export const calculateDerivedValues = (retailPriceG: number, grossMarginG: number, targetProfit: number) => {
  // Calculate cost of goods sold (COGS)
  const cogs = retailPriceG - grossMarginG

  // Calculate units needed to achieve target profit
  const unitsNeeded = targetProfit / grossMarginG

  // Calculate total revenue
  const totalRevenue = unitsNeeded * retailPriceG

  return {
    cogs,
    unitsNeeded,
    totalRevenue,
  }
}

// Format kilograms with "kg" suffix
export const formatKilograms = (kilograms: number | undefined | null): string => {
  if (kilograms === undefined || kilograms === null) return "0.00kg"
  return `${kilograms.toFixed(2)}kg`
}

// Format ounces with "oz" suffix
export const formatOunces = (ounces: number | undefined | null): string => {
  if (ounces === undefined || ounces === null) return "0.00oz"
  return `${ounces.toFixed(2)}oz`
}

// Format percentage
export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0%"
  return `${Math.round(value * 100)}%`
}

// Convert grams to ounces
export const gramsToOunces = (grams: number): number => {
  return grams / 28.3495
}

// Convert ounces to grams
export const ouncesToGrams = (ounces: number): number => {
  return ounces * 28.3495
}

// Convert grams to kilograms
export const gramsToKilograms = (grams: number): number => {
  return grams / 1000
}

// Convert kilograms to grams
export const kilogramsToGrams = (kilograms: number): number => {
  return kilograms * 1000
}

// Calculate price points based on wholesale price
export const calculatePricePoints = ( markupPercentages: number[], targetProfit: number, businessData: BusinessData): PricePoint[] => {
  const { wholesalePricePerOz, targetProfitPerMonth, operatingExpenses } = businessData
  const wholesalePricePerGram = wholesalePricePerOz / 28.35

  return markupPercentages.map((markupPercentage) => {
    // Calculate retail price based on markup
    const retailPricePerGram = wholesalePricePerGram * (1 + markupPercentage / 100)

    // Calculate profit per gram
    const profitPerGram = retailPricePerGram - wholesalePricePerGram

    // Calculate break-even quantity (including operating expenses)
    const totalMonthlyExpenses = operatingExpenses + targetProfitPerMonth
    const breakEvenGramsPerMonth = totalMonthlyExpenses / profitPerGram
    const breakEvenOuncesPerMonth = gramsToOunces(breakEvenGramsPerMonth)

    // Calculate monthly financials
    const monthlyRevenue = retailPricePerGram * breakEvenGramsPerMonth
    const monthlyCost = wholesalePricePerGram * breakEvenGramsPerMonth
    const monthlyProfit = monthlyRevenue - monthlyCost - operatingExpenses

    // Calculate ROI
    const totalInvestment = monthlyCost + operatingExpenses
    const roi = (monthlyProfit / totalInvestment) * 100

    return {
      id: uuidv4(),
      markupPercentage,
      retailPrice: retailPricePerGram,
      profitPerGram,
      breakEvenGramsPerMonth,
      breakEvenOuncesPerMonth,
      monthlyRevenue,
      monthlyCost,
      monthlyProfit,
      roi,
      wholesalePricePerGram,
      retailPricePerGram,
    }
  })
}

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
