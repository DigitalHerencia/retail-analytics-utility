import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import type { PricePoint, BusinessData } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Ensure value is a number before formatting
const ensureNumber = (value: any): number => {
  if (value === undefined || value === null) return 0
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

// Formatting functions with enhanced type safety
export const formatCurrency = (value: any): string => {
  const num = ensureNumber(value)
  return `$${num.toFixed(2)}`
}

// Format grams with "g" suffix
export const formatGrams = (grams: any): string => {
  const num = ensureNumber(grams)
  return `${num.toFixed(2)}g`
}

// Format kilograms with "kg" suffix
export const formatKilograms = (kilograms: any): string => {
  const num = ensureNumber(kilograms)
  return `${num.toFixed(2)}kg`
}

// Format ounces with "oz" suffix
export const formatOunces = (ounces: any): string => {
  const num = ensureNumber(ounces)
  return `${num.toFixed(2)}oz`
}

// Format percentage
export const formatPercentage = (value: any): string => {
  const num = ensureNumber(value)
  return `${Math.round(num * 100)}%`
}

// Convert grams to ounces with safety
export const gramsToOunces = (grams: any): number => {
  const num = ensureNumber(grams)
  return num / 28.3495
}

// Convert ounces to grams with safety
export const ouncesToGrams = (ounces: any): number => {
  const num = ensureNumber(ounces)
  return num * 28.3495
}

// Convert grams to kilograms with safety
export const gramsToKilograms = (grams: any): number => {
  const num = ensureNumber(grams)
  return num / 1000
}

// Convert kilograms to grams with safety
export const kilogramsToGrams = (kilograms: any): number => {
  const num = ensureNumber(kilograms)
  return num * 1000
}

// Calculate price points based on wholesale price
export const calculatePricePoints = (businessData: BusinessData, markupPercentages: number[]): PricePoint[] => {
  // Ensure all values are numbers
  const wholesalePricePerOz = ensureNumber(businessData.wholesalePricePerOz)
  const targetProfitPerMonth = ensureNumber(businessData.targetProfitPerMonth)
  const operatingExpenses = ensureNumber(businessData.operatingExpenses)

  const wholesalePricePerGram = wholesalePricePerOz / 28.35

  return markupPercentages.map((markupPercentage) => {
    // Calculate retail price based on markup
    const retailPricePerGram = wholesalePricePerGram * (1 + markupPercentage / 100)

    // Calculate profit per gram
    const profitPerGram = retailPricePerGram - wholesalePricePerGram

    // Calculate break-even quantity (including operating expenses)
    const totalMonthlyExpenses = operatingExpenses + targetProfitPerMonth
    const breakEvenGramsPerMonth = profitPerGram > 0 ? totalMonthlyExpenses / profitPerGram : 0
    const breakEvenOuncesPerMonth = gramsToOunces(breakEvenGramsPerMonth)

    // Calculate monthly financials
    const monthlyRevenue = retailPricePerGram * breakEvenGramsPerMonth
    const monthlyCost = wholesalePricePerGram * breakEvenGramsPerMonth
    const monthlyProfit = monthlyRevenue - monthlyCost - operatingExpenses

    // Calculate ROI
    const totalInvestment = monthlyCost + operatingExpenses
    const roi = totalInvestment > 0 ? (monthlyProfit / totalInvestment) * 100 : 0

    return {
      id: uuidv4(),
      markupPercentage,
      retailPricePerGram,
      profitPerGram,
      breakEvenGramsPerMonth,
      breakEvenOuncesPerMonth,
      monthlyRevenue,
      monthlyCost,
      monthlyProfit,
      roi,
    }
  })
}

// Calculate derived business values from raw data
export const calculateDerivedValues = (data: any) => {
  // Ensure all input values are numbers
  const wholesalePricePerOz = ensureNumber(data.wholesalePricePerOz)
  const retailPricePerGram = ensureNumber(data.retailPricePerGram)
  const monthlySalesQuantity = ensureNumber(data.monthlySalesQuantity)
  const operatingExpenses = ensureNumber(data.operatingExpenses)
  const commissionRate = ensureNumber(data.commissionRate)

  // Convert wholesale price to per gram
  const wholesalePricePerGram = wholesalePricePerOz / 28.3495

  // Calculate monthly values
  const monthlySalesGrams = monthlySalesQuantity
  const monthlyRevenue = monthlySalesGrams * retailPricePerGram
  const monthlyCost = monthlySalesGrams * wholesalePricePerGram

  // Calculate profit before commission and expenses
  const grossProfit = monthlyRevenue - monthlyCost

  // Calculate commission if applicable
  const commission = commissionRate ? (commissionRate / 100) * monthlyRevenue : 0

  // Calculate net profit
  const netProfit = grossProfit - operatingExpenses - commission

  // Calculate profit margin
  const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0

  // Calculate ROI
  const investment = monthlyCost + operatingExpenses
  const roi = investment > 0 ? (netProfit / investment) * 100 : 0

  // Calculate profit per gram
  const profitPerGram = monthlySalesGrams > 0 ? netProfit / monthlySalesGrams : 0

  // Calculate break-even quantity
  const profitPerGramBeforeExpenses = retailPricePerGram - wholesalePricePerGram
  const breakEvenGrams = profitPerGramBeforeExpenses > 0 ? operatingExpenses / profitPerGramBeforeExpenses : 0

  return {
    wholesalePricePerGram,
    monthlyRevenue,
    monthlyCost,
    grossProfit,
    commission,
    netProfit,
    profitMargin,
    roi,
    profitPerGram,
    breakEvenGrams,
    breakEvenOunces: breakEvenGrams / 28.3495,
  }
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
