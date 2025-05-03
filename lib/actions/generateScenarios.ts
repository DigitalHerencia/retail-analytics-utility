'use server'
import { calculateDerivedValues } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import type { ScenarioData } from '@/types'

export async function generateScenarios(formData: FormData): Promise<ScenarioData[]> {
  const basePrice = Number(formData.get('basePrice'))
  const priceIncrement = Number(formData.get('priceIncrement'))
  const grossMarginPercentage = Number(formData.get('grossMarginPercentage'))
  const targetProfit = Number(formData.get('targetProfit'))

  const generatedScenarios: ScenarioData[] = []

  for (let i = 5; i > 0; i--) {
    const price = Math.max(basePrice - i * priceIncrement, priceIncrement)
    const margin = (price * grossMarginPercentage) / 100
    const derivedValues = calculateDerivedValues(price, margin, targetProfit)
    generatedScenarios.push({
      id: uuidv4(),
      scenario: `P${price.toFixed(0)}`,
      retailPriceG: price,
      grossMarginG: margin,
      netProfit: targetProfit,
      ...derivedValues,
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
    scenario: `P${basePrice.toFixed(0)}*`,
    retailPriceG: basePrice,
    grossMarginG: baseMargin,
    netProfit: targetProfit,
    ...baseDerivedValues,
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
      scenario: `P${price.toFixed(0)}`,
      retailPriceG: price,
      grossMarginG: margin,
      netProfit: targetProfit,
      ...derivedValues,
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