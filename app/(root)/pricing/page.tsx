"use client"

import { HustleStat } from "@/components/hustle-stat"
import { HustleTip } from "@/components/hustle-tip"
import { DollarSign, TrendingUp, FileStack } from "lucide-react"
import SimplifiedPricing from "@/components/simplified-pricing"
import { usePricing } from "@/hooks/use-pricing"
import { formatCurrency } from "@/lib/utils"

export default function PricingPage() {
  // Get pricing data from context
  const { retailPricePerGram, wholesalePricePerGram, markupPercentage } = usePricing()

  // Calculate profit per gram and profit margin
  const profitPerGram = retailPricePerGram - wholesalePricePerGram
  const profitMarginPercentage = (profitPerGram / retailPricePerGram) * 100
  
  // Calculate retail price per ounce
  const retailPricePerOunce = retailPricePerGram * 28.35

  return (
    <div className="container py-4 px-6">
      <div className="text-center mb-6">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">PRICING</h1>
          <p className="text-white/80 mt-1">Set your product pricing and maximize your profits</p>
        </div>
        <HustleTip title="PRODUCT PRICING">
          <p>
            Set your wholesale cost and markup percentage to automatically calculate your retail price.
            Your pricing will be applied site-wide, affecting inventory valuation, sales calculations,
            and profit forecasting.
          </p>
        </HustleTip>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 w-full">
        <div className="flex-1 w-full">
          <HustleStat 
            title="RETAIL PRICE"
            value={formatCurrency(retailPricePerGram) + "/g"}
            icon={<DollarSign className="h-5 w-5 text-white" />}
            className="border-white w-full h-full"
          />
        </div>
        <div className="flex-1 w-full">
          <HustleStat 
            title="PROFIT MARGIN"
            value={`${Math.round(profitMarginPercentage)}%`}
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            className="border-white w-full h-full"
          />
        </div>
        <div className="flex-1 w-full">
          <HustleStat 
            title="PRICE PER OZ"
            value={formatCurrency(retailPricePerOunce)}
            icon={<FileStack className="h-5 w-5 text-white" />}
            className="border-white w-full h-full"
          />
        </div>
      </div>
      
      <SimplifiedPricing />
    </div>
  )
}
