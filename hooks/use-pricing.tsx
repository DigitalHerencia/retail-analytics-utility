"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type PricingContextType = {
  retailPricePerGram: number
  markupPercentage: number
  wholesalePricePerGram: number
  setRetailPrice: (price: number) => void
  setMarkupPercentage: (percentage: number) => void
  setWholesalePrice: (price: number) => void
  calculateRetailPrice: (wholesalePricePerGram: number, markup: number) => number
}

const PricingContext = createContext<PricingContextType | undefined>(undefined)

export function PricingProvider({ children }: { children: ReactNode }) {
  const [retailPricePerGram, setRetailPricePerGram] = useState(15) // Default retail price
  const [markupPercentage, setMarkupPercentage] = useState(100) // Default markup
  const [wholesalePricePerGram, setWholesalePricePerGram] = useState(7.5) // Default wholesale price

  // Load pricing data from localStorage on initial render
  useEffect(() => {
    const savedPricing = localStorage.getItem("pricing-data")
    if (savedPricing) {
      try {
        const { retailPrice, markup, wholesalePrice } = JSON.parse(savedPricing)
        setRetailPricePerGram(retailPrice || 15)
        setMarkupPercentage(markup || 100)
        setWholesalePricePerGram(wholesalePrice || 7.5)
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
        wholesalePrice: wholesalePricePerGram
      })
    )
  }, [retailPricePerGram, markupPercentage, wholesalePricePerGram])

  // Update retail price
  const setRetailPrice = (price: number) => {
    setRetailPricePerGram(price)
    // If retail price is updated, recalculate markup while keeping wholesale price stable
    if (wholesalePricePerGram > 0) {
      const newMarkup = ((price - wholesalePricePerGram) / wholesalePricePerGram) * 100
      setMarkupPercentage(Math.round(newMarkup))
    }
  }

  // Update markup percentage
  const updateMarkupPercentage = (percentage: number) => {
    setMarkupPercentage(percentage)
    // When markup changes, recalculate retail price while keeping wholesale price stable
    const newRetailPrice = calculateRetailPrice(wholesalePricePerGram, percentage)
    setRetailPricePerGram(newRetailPrice)
  }

  // Update wholesale price
  const setWholesalePrice = (price: number) => {
    setWholesalePricePerGram(price)
    // When wholesale price changes, recalculate retail price based on current markup
    const newRetailPrice = calculateRetailPrice(price, markupPercentage)
    setRetailPricePerGram(newRetailPrice)
  }

  // Helper to calculate retail price from wholesale price and markup
  const calculateRetailPrice = (wholesalePricePerGram: number, markup: number) => {
    return wholesalePricePerGram * (1 + markup / 100)
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
        calculateRetailPrice
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