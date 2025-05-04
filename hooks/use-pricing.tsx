"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Scenario = {
  id?: string;
  retailPriceG: number;
  // Add any other fields you use for scenarios
}

type PricingContextType = {
  retailPricePerGram: number
  markupPercentage: number
  wholesalePricePerGram: number
  setRetailPrice: (price: number) => void
  setMarkupPercentage: (percentage: number) => void
  setWholesalePrice: (price: number) => void
  calculateRetailPrice: (wholesalePricePerGram: number, markup: number) => number
  scenarios: Scenario[]
  setScenarios: (scenarios: Scenario[]) => void
}

const PricingContext = createContext<PricingContextType | undefined>(undefined)

export function PricingProvider({ children }: { children: ReactNode }) {
  const [retailPricePerGram, setRetailPricePerGram] = useState(100) // Default retail price per gram
  const [markupPercentage, setMarkupPercentage] = useState(251) // Default markup for 28.50 -> 100
  const [wholesalePricePerGram, setWholesalePricePerGram] = useState(28.5) // Default wholesale price per gram
  const [scenarios, setScenarios] = useState<Scenario[]>([])

  // Load pricing data from localStorage on initial render
  useEffect(() => {
    const savedPricing = localStorage.getItem("pricing-data")
    if (savedPricing) {
      try {
        const { retailPrice, markup, wholesalePrice, scenarios: savedScenarios } = JSON.parse(savedPricing)
        setRetailPricePerGram(retailPrice || 100)
        setMarkupPercentage(markup || 251)
        setWholesalePricePerGram(wholesalePrice || 28.5)
        setScenarios(savedScenarios || [])
      } catch (error) {
        console.error("Error loading pricing data:", error)
      }
    }
  }, [])

  // Save pricing data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "pricing-data",
      JSON.stringify({
        retailPrice: retailPricePerGram,
        markup: markupPercentage,
        wholesalePrice: wholesalePricePerGram,
        scenarios
      })
    )
  }, [retailPricePerGram, markupPercentage, wholesalePricePerGram, scenarios])

  // Update retail price with GAAP-compliant calculation
  const setRetailPrice = (price: number) => {
    setRetailPricePerGram(price)
    // If retail price is updated, recalculate markup while keeping wholesale price stable
    if (wholesalePricePerGram > 0) {
      // Formula: Markup % = ((Retail Price - Wholesale Price) / Wholesale Price) * 100
      const newMarkup = ((price - wholesalePricePerGram) / wholesalePricePerGram) * 100
      setMarkupPercentage(Math.round(newMarkup))
    }
  }

  // Update markup percentage with GAAP-compliant calculation
  const updateMarkupPercentage = (percentage: number) => {
    setMarkupPercentage(percentage)
    // When markup changes, recalculate retail price while keeping wholesale price stable
    // Formula: Retail Price = Wholesale Price * (1 + Markup % / 100)
    const newRetailPrice = wholesalePricePerGram * (1 + percentage / 100)
    setRetailPricePerGram(Number(Number(newRetailPrice).toFixed(2)))
  }
  
  // Update wholesale price with GAAP-compliant calculation
  const setWholesalePrice = (price: number) => {
    setWholesalePricePerGram(price)
    // When wholesale price changes, recalculate retail price using current markup
    // Formula: Retail Price = Wholesale Price * (1 + Markup % / 100)
    const newRetailPrice = price * (1 + markupPercentage / 100)
    setRetailPricePerGram(Number(Number(newRetailPrice).toFixed(2)))
  }
  
  // Calculate retail price based on wholesale price and markup (used by other components)
  const calculateRetailPrice = (wholesalePrice: number, markup: number) => {
    // Formula: Retail Price = Wholesale Price * (1 + Markup % / 100)
    return wholesalePrice * (1 + markup / 100)
  }

  return (
    <PricingContext.Provider
      value={{
        retailPricePerGram,
        markupPercentage,
        wholesalePricePerGram,
        setRetailPrice,
        setMarkupPercentage: updateMarkupPercentage,
        setWholesalePrice,
        calculateRetailPrice,
        scenarios,
        setScenarios
      }}
    >
      {children}
    </PricingContext.Provider>
  )
}

// Hook to use pricing context
export function usePricing() {
  const context = useContext(PricingContext)
  if (context === undefined) {
    throw new Error("usePricing must be used within a PricingProvider")
  }
  return context
}