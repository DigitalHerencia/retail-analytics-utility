"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DollarSign, Percent, Check } from "lucide-react"
import { formatCurrency, businessConcepts } from "@/lib/utils"
import { HustleTip } from "@/components/hustle-tip"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePricing } from "@/hooks/use-pricing"

export default function SimplifiedPricing() {
  const { 
    retailPricePerGram,
    markupPercentage,
    wholesalePricePerGram,
    setRetailPrice,
    setMarkupPercentage,
    setWholesalePrice
  } = usePricing()

  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Calculate profit per gram (revenue - cost)
  const profitPerGram = retailPricePerGram - wholesalePricePerGram
  
  // Calculate profit margin percentage (profit / revenue) * 100
  // This follows GAAP principles for margin calculation
  const profitMarginPercentage = (profitPerGram / retailPricePerGram) * 100
  
  // Calculate retail price per ounce (convert from grams)
  const retailPricePerOunce = retailPricePerGram * 28.35
  
  // Calculate profit per ounce
  const profitPerOunce = profitPerGram * 28.35

  // Handle markup slider changes
  const handleMarkupChange = (value: number[]) => {
    setMarkupPercentage(value[0])
  }

  // Handle wholesale price input changes
  const handleWholesalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setWholesalePrice(value)
    }
  }

  // Handle retail price input changes
  const handleRetailPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setRetailPrice(value)
    }
  }

  // Display success message when pricing is saved
  const handleSavePricing = () => {
    // The data is already saved in localStorage through the context
    // Show success message
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  return (
    <div className="px-4 space-y-6">
      <Card className="card-hover card-sharp border-white overflow-hidden">
        <CardHeader className="bg-black border-b border-white/20">
          <CardTitle className="gangster-font text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2" /> PRICING SETTINGS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center justify-between mb-2 gangster-font">
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-white" />
                    WHOLESALE COST PER GRAM
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-help">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{businessConcepts.wholesale}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className="font-medium white-text">{formatCurrency(wholesalePricePerGram)}</span>
                </Label>
                <Input
                  type="number"
                  value={wholesalePricePerGram}
                  onChange={handleWholesalePriceChange}
                  step="0.1"
                  min="0.1"
                  className="text-lg input-sharp"
                />
                <p className="text-xs text-white/60">Your cost per ounce: {formatCurrency(wholesalePricePerGram * 28.35)}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between mb-2 gangster-font">
                  <span className="flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-white" />
                    MARKUP PERCENTAGE: {markupPercentage}%
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-help">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{businessConcepts.markup}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </Label>
                <Slider
                  value={[markupPercentage]}
                  min={10}
                  max={300}
                  step={5}
                  onValueChange={handleMarkupChange}
                  className="mb-6"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center justify-between mb-2 gangster-font">
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-white" />
                    RETAIL PRICE PER GRAM
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-help">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{businessConcepts.retail}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className="font-medium white-text">{formatCurrency(retailPricePerGram)}</span>
                </Label>
                <Input
                  type="number"
                  value={retailPricePerGram}
                  onChange={handleRetailPriceChange}
                  step="0.1"
                  min="0.1"
                  className="text-lg input-sharp"
                />
                <p className="text-xs text-white/60">Your retail price per ounce: {formatCurrency(retailPricePerOunce)}</p>
              </div>
            </div>
          </div>

          {/* Combined price breakdown and profit info into one uniform width table */}
          <div className="bg-smoke p-4 w-full">
            <div className="text-lg font-medium text-center mb-4 white-text gangster-font">PRICE BREAKDOWN</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="gangster-font">PROFIT PER GRAM:</span>
                  <span className="text-white font-medium">{formatCurrency(profitPerGram)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="gangster-font">PROFIT MARGIN:</span>
                  <span className="text-white font-medium">{profitMarginPercentage.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="gangster-font">COST:</span>
                  <span className="text-white/80">{formatCurrency(wholesalePricePerGram)} per gram</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="gangster-font">+ PROFIT:</span>
                  <span className="text-white/80">{formatCurrency(profitPerGram)} per gram</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                  <span className="gangster-font">= RETAIL PRICE:</span>
                  <span className="text-white font-medium">{formatCurrency(retailPricePerGram)} per gram</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSavePricing}
            className="w-full bg-white hover:bg-white/90 text-black button-sharp border-white"
          >
            {saveSuccess ? (
              <><Check className="h-4 w-4 mr-2" /> PRICING SAVED</>
            ) : (
              "SAVE PRICING SETTINGS"
            )}
          </Button>
        </CardContent>
      </Card>
      
      <HustleTip title="PRICING STRATEGY">
        <p>
          Your current markup is <strong>{markupPercentage}%</strong> which gives you <strong>{formatCurrency(profitPerGram)}</strong> profit per gram.
          This is a {profitMarginPercentage < 30 ? "low" : profitMarginPercentage < 50 ? "moderate" : "premium"} pricing strategy.
        </p>
        <p className="mt-2">
          {profitMarginPercentage < 30 
            ? "Consider increasing your markup to improve profitability." 
            : profitMarginPercentage > 70
              ? "Your high margin could maximize per-unit profit but may limit volume. Consider offering tier pricing for bulk buyers."
              : "You've found a good balance between profit and volume. Keep monitoring competitor pricing."}
        </p>
      </HustleTip>
    </div>
  )
}