"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DollarSign, Percent, Check, TrendingUp } from "lucide-react"
import { formatCurrency, businessConcepts, formatPercentage } from "@/lib/utils"
import { HustleTip } from "@/components/hustle-tip"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as z from "zod"
import { HustleStat } from "@/components/hustle-stat"
import type { BusinessData } from "@/types"
import { useActionState } from "react"
import { updatePriceAction } from "@/lib/actions/updatePriceAction"

const formSchema = z.object({
  wholesalePricePerGram: z.coerce.number().min(0.01),
  markupPercentage: z.coerce.number().min(1).max(300),
  retailPricePerGram: z.coerce.number().min(0.01),
})

interface SimplifiedPricingProps {
  businessData: BusinessData
}

export default function SimplifiedPricing({ businessData }: SimplifiedPricingProps) {
  const wholesalePricePerGram = businessData.wholesalePricePerOz / 28.35
  const markupPercentage = businessData.markupPercentage ?? 100
  const retailPricePerGram = businessData.retailPricePerGram ?? (wholesalePricePerGram * (1 + markupPercentage / 100))
  const profitPerGram = retailPricePerGram - wholesalePricePerGram
  const profitMarginPercentage = (profitPerGram / retailPricePerGram) * 100
  const retailPricePerOunce = retailPricePerGram * 28.35
  const roi = wholesalePricePerGram > 0 ? (profitPerGram / wholesalePricePerGram) * 100 : 0

  interface FormState {
    success: boolean;
    error?: string;
  }

  interface FormValues {
    wholesalePricePerGram: number;
    markupPercentage: number;
    retailPricePerGram: number;
  }

  const [formState, formAction] = useActionState<FormState, FormData>(
    async (_prevState, formData: FormData) => {
      const values: FormValues = {
        wholesalePricePerGram: Number(formData.get("wholesalePricePerGram")),
        markupPercentage: Number(formData.get("markupPercentage")),
        retailPricePerGram: Number(formData.get("retailPricePerGram")),
      }
      const parsed = formSchema.safeParse(values)
      if (!parsed.success) {
        return { success: false, error: "Invalid input." }
      }
      const formDataToSend = new FormData();
      formDataToSend.append("wholesalePricePerOz", String(values.wholesalePricePerGram * 28.35));
      formDataToSend.append("markupPercentage", String(values.markupPercentage));
      formDataToSend.append("retailPricePerGram", String(values.retailPricePerGram));

      await updatePriceAction(formDataToSend);
      return { success: true }
    },
    { success: false, error: undefined }
  )

  const [localForm, setLocalForm] = useState({
    wholesalePricePerGram,
    markupPercentage,
    retailPricePerGram,
  })

  const handleMarkupChange = (value: number[]) => {
    const markup = value[0]
    const newRetail = Number((localForm.wholesalePricePerGram * (1 + markup / 100)).toFixed(2))
    setLocalForm(f => ({ ...f, markupPercentage: markup, retailPricePerGram: newRetail }))
  }

  const handleWholesaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0.01) {
      const markup = localForm.markupPercentage
      const newRetail = Number((value * (1 + markup / 100)).toFixed(2))
      setLocalForm(f => ({ ...f, wholesalePricePerGram: value, retailPricePerGram: newRetail }))
    }
  }

  const handleRetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0.01) {
      const wholesale = localForm.wholesalePricePerGram
      const newMarkup = wholesale > 0 ? Math.round(((value - wholesale) / wholesale) * 100) : 100
      setLocalForm(f => ({ ...f, retailPricePerGram: value, markupPercentage: newMarkup }))
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="ROI"
          value={formatPercentage(roi / 100)}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="Margin"
          value={formatPercentage(profitMarginPercentage / 100)}
          icon={<Percent className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="Profit"
          value={formatCurrency(profitPerGram) + "/g"}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          className="border-white"
        />
      </div>
      <Card className="card-hover card-sharp border-white overflow-hidden">
        <CardHeader className="bg-black border-b border-white/20">
          <CardTitle className="gangster-font text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2" /> PRICING SETTINGS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form action={formAction}>
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
                    <span className="font-medium white-text">{formatCurrency(localForm.wholesalePricePerGram)}</span>
                  </Label>
                  <Input
                    type="number"
                    name="wholesalePricePerGram"
                    value={localForm.wholesalePricePerGram}
                    onChange={handleWholesaleChange}
                    step="0.01"
                    min="0.01"
                    className="text-lg input-sharp"
                  />
                  <p className="text-xs text-white/60">Your cost per ounce: {formatCurrency(localForm.wholesalePricePerGram * 28.35)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center justify-between mb-2 gangster-font">
                    <span className="flex items-center">
                      <Percent className="h-4 w-4 mr-1 text-white" />
                      MARKUP PERCENTAGE: {localForm.markupPercentage}%
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
                    value={[localForm.markupPercentage]}
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
                    <span className="font-medium white-text">{formatCurrency(localForm.retailPricePerGram)}</span>
                  </Label>
                  <Input
                    type="number"
                    name="retailPricePerGram"
                    value={localForm.retailPricePerGram}
                    onChange={handleRetailChange}
                    step="0.01"
                    min="0.01"
                    className="text-lg input-sharp"
                  />
                  <p className="text-xs text-white/60">Your retail price per ounce: {formatCurrency(localForm.retailPricePerGram * 28.35)}</p>
                </div>
              </div>
              <input type="hidden" name="markupPercentage" value={localForm.markupPercentage} />
              <div className="col-span-2">
                <Button type="submit" className="w-full bg-white hover:bg-white/90 text-black button-sharp border-white">
                  {formState.success ? (
                    <><Check className="h-4 w-4 mr-2" /> PRICING SAVED</>
                  ) : (
                    "SAVE PRICING SETTINGS"
                  )}
                </Button>
                {formState.error && <div className="text-red-500 mt-2">{formState.error}</div>}
              </div>
            </div>
          </form>
          <div className="bg-smoke p-4 w-full mt-6">
            <div className="text-lg font-medium text-center mb-4 white-text gangster-font">PRICE BREAKDOWN</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="gangster-font">PROFIT PER GRAM:</span>
                  <span className="text-white font-medium">{formatCurrency(localForm.retailPricePerGram - localForm.wholesalePricePerGram)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="gangster-font">PROFIT MARGIN:</span>
                  <span className="text-white font-medium">{formatPercentage(((localForm.retailPricePerGram - localForm.wholesalePricePerGram) / localForm.retailPricePerGram) || 0)}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="gangster-font">COST:</span>
                  <span className="text-white/80">{formatCurrency(localForm.wholesalePricePerGram)} per gram</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="gangster-font">+ PROFIT:</span>
                  <span className="text-white/80">{formatCurrency(localForm.retailPricePerGram - localForm.wholesalePricePerGram)} per gram</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                  <span className="gangster-font">= RETAIL PRICE:</span>
                  <span className="text-white font-medium">{formatCurrency(localForm.retailPricePerGram)} per gram</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <HustleTip title="PRICING STRATEGY">
        <p>
          Your current markup is <strong>{localForm.markupPercentage}%</strong> which gives you <strong>{formatCurrency(localForm.retailPricePerGram - localForm.wholesalePricePerGram)}</strong> profit per gram.
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