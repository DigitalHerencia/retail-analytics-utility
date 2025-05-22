'use server'
import { calculateDerivedValues } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import type { ScenarioData } from '@/types'
import { auth } from "@clerk/nextjs/server"
import sql from "../db/db"

export async function generateScenarios(formData: FormData): Promise<ScenarioData[]> {
  const basePrice = Number(formData.get('basePrice'))
  const priceIncrement = Number(formData.get('priceIncrement'))
  const grossMarginPercentage = Number(formData.get('grossMarginPercentage'))
  const targetProfit = Number(formData.get('targetProfit'))
  
  // Get the authenticated user's ID first
  const { userId } = await auth()
  
  // Retrieve the tenantId associated with this user
  let tenantId = userId || 'default' // Ensure tenantId is never null
  
  if (userId) {
    try {
      const result = await sql`SELECT tenant_id FROM users WHERE clerk_id = ${userId}`
      if (result.length > 0 && result[0].tenant_id) {
        tenantId = result[0].tenant_id
      }
    } catch (error) {
      console.error("Error retrieving tenant ID:", error)
    }
  }

  const generatedScenarios: ScenarioData[] = []

  for (let i = 5; i > 0; i--) {
    const price = Math.max(basePrice - i * priceIncrement, priceIncrement)
    const margin = (price * grossMarginPercentage) / 100
    const derivedValues = calculateDerivedValues(price, margin, targetProfit)
    generatedScenarios.push({
      id: uuidv4(),
      scenario: `P${Math.round(price)}`,
      retailPriceG: price,
      grossMarginG: margin,
      netProfit: targetProfit,
      ...derivedValues,
      tenantId,
      monthlyRevenue: 0,
      monthlyCost: 0,
      netProfitAfterCommission: 0,
      totalCommission: 0,
      salespeople: [],
      breakEvenGramsPerMonth: 0,
      breakEvenOuncesPerMonth: 0,
      profitPerGram: 0,
      wholesalePricePerGram: 0,
      retailPricePerGram: 0
    })
  }

  const baseMargin = (basePrice * grossMarginPercentage) / 100
  const baseDerivedValues = calculateDerivedValues(basePrice, baseMargin, targetProfit)
  generatedScenarios.push({
    id: uuidv4(),
    scenario: `P${Math.round(basePrice)}*`,
    retailPriceG: basePrice,
    grossMarginG: baseMargin,
    netProfit: targetProfit,
    ...baseDerivedValues,
    tenantId,
    monthlyRevenue: 0,
    monthlyCost: 0,
    netProfitAfterCommission: 0,
    totalCommission: 0,
    salespeople: [],
    breakEvenGramsPerMonth: 0,
    breakEvenOuncesPerMonth: 0,
    profitPerGram: 0,
    wholesalePricePerGram: 0,
    retailPricePerGram: 0
  })

  for (let i = 1; i <= 5; i++) {
    const price = basePrice + i * priceIncrement
    const margin = (price * grossMarginPercentage) / 100
    const derivedValues = calculateDerivedValues(price, margin, targetProfit)
    generatedScenarios.push({
      id: uuidv4(),
      scenario: `P${Math.round(price)}`,
      retailPriceG: price,
      grossMarginG: margin,
      netProfit: targetProfit,
      ...derivedValues,
      tenantId,
      monthlyRevenue: 0,
      monthlyCost: 0,
      netProfitAfterCommission: 0,
      totalCommission: 0,
      salespeople: [],
      breakEvenGramsPerMonth: 0,
      breakEvenOuncesPerMonth: 0,
      profitPerGram: 0,
      wholesalePricePerGram: 0,
      retailPricePerGram: 0
    })
  }

  return generatedScenarios
}