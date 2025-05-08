"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import PriceTable from "@/components/price-table"
import PriceCharts from "@/components/price-charts"
import { calculatePricePoints, formatCurrency } from "@/lib/utils"
import { defaultMarkupPercentages, type PricePoint, type BusinessData } from "@/lib/data"
import { HustleTip } from "@/components/hustle-tip"
import { DollarSign, TrendingUp, Percent } from "lucide-react"

const formSchema = z.object({
  wholesalePrice: z.coerce.number().positive("Wholesale price must be positive"),
  unit: z.enum(["gram", "ounce"]),
  targetProfit: z.coerce.number().positive("Target profit must be positive"),
})

interface RetailPricingToolProps {
  businessData?: BusinessData
  pricePoints?: PricePoint[]
  selectedPricePointId?: string | null
  onPricePointsUpdate?: (points: PricePoint[]) => void
  onPricePointSelect?: (id: string) => void
  showTips?: boolean
  onHideTips?: () => void
}

export default function RetailPricingTool({
  businessData,
  pricePoints = [],
  selectedPricePointId = null,
  onPricePointsUpdate = () => {},
  onPricePointSelect = () => {},
  showTips = true,
  onHideTips = () => {},
}: RetailPricingToolProps) {
  const [localPricePoints, setLocalPricePoints] = useState<PricePoint[]>(pricePoints)
  const [localSelectedPricePointId, setLocalSelectedPricePointId] = useState<string | null>(selectedPricePointId)
  const [markupPercentages, setMarkupPercentages] = useState<number[]>(defaultMarkupPercentages)
  const [activeView, setActiveView] = useState<"table" | "charts">("table")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wholesalePrice: businessData?.wholesalePricePerOz || 100,
      unit: "ounce",
      targetProfit: businessData?.targetProfitPerMonth || 2000,
    },
  })

  // Update form when businessData changes
  useEffect(() => {
    if (businessData?.targetProfitPerMonth) {
      form.setValue("targetProfit", businessData.targetProfitPerMonth)
    }
    if (businessData?.wholesalePricePerOz) {
      form.setValue("wholesalePrice", businessData.wholesalePricePerOz)
    }
  }, [businessData, form])

  // Calculate price points when form values change
  const calculatePrices = (data: z.infer<typeof formSchema>) => {
    const { wholesalePrice, unit, targetProfit } = data

    // Create a temporary businessData object for calculation
    const tempBusinessData: BusinessData = {
      wholesalePricePerOz: unit === "ounce" ? wholesalePrice : wholesalePrice * 28.35,
      targetProfitPerMonth: targetProfit,
      operatingExpenses: businessData?.operatingExpenses || 500,
    }

    const newPricePoints = calculatePricePoints(tempBusinessData, markupPercentages)
    setLocalPricePoints(newPricePoints)
    onPricePointsUpdate(newPricePoints)

    // Select the middle price point by default
    if (newPricePoints.length > 0) {
      const middleIndex = Math.floor(newPricePoints.length / 2)
      setLocalSelectedPricePointId(newPricePoints[middleIndex].id)
      onPricePointSelect(newPricePoints[middleIndex].id)
    }
  }

  // Initial calculation
  useEffect(() => {
    const { wholesalePrice, unit, targetProfit } = form.getValues()
    calculatePrices({ wholesalePrice, unit, targetProfit })
  }, [])

  // Handle price point selection
  const handlePricePointSelect = (id: string) => {
    setLocalSelectedPricePointId(id)
    onPricePointSelect(id)
  }

  const selectedPricePoint =
    localPricePoints.find((p) => p.id === localSelectedPricePointId) ||
    (localPricePoints.length > 0 ? localPricePoints[Math.floor(localPricePoints.length / 2)] : null)

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold graffiti-font text-shadow">PRICING</h1>
          <p className="text-white/80 mt-1">SET YOUR PRICES. MAXIMIZE YOUR PROFITS.</p>
        </div>

        {showTips && (
          <HustleTip title="STRATEGY">
            <p>
              Your pricing strategy directly impacts your bottom line. Find the sweet spot between volume and margin.
              Too high, and you lose customers. Too low, and you leave money on the table.
            </p>
            <Button variant="link" className="p-0 h-auto text-gold" onClick={onHideTips}>
              Got it
            </Button>
          </HustleTip>
        )}
      </div>

      <Card className="card-hover card-sharp border-gold">
        <CardHeader>
          <CardTitle className="gangster-font text-gold">PRICING CALCULATOR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculatePrices)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="wholesalePrice"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gangster-font">
                        <DollarSign className="h-4 w-4 mr-1 text-gold" />
                        WHOLESALE PRICE
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0.01" {...field} className="input-sharp" />
                      </FormControl>
                      <FormDescription>The price you pay per gram/ounce</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="gangster-font">UNIT</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="gram" id="gram" />
                            <Label htmlFor="gram">Per Gram</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ounce" id="ounce" />
                            <Label htmlFor="ounce">Per Ounce</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetProfit"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gangster-font">
                        <TrendingUp className="h-4 w-4 mr-1 text-money" />
                        TARGET MONTHLY PROFIT
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="100" min="100" {...field} className="input-sharp" />
                      </FormControl>
                      <FormDescription>Your target monthly profit</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-smoke p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="gangster-font flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-gold" />
                    MARKUP PERCENTAGES
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  The calculator will show results for these markup percentages:
                </p>
                <div className="flex flex-wrap gap-2">
                  {markupPercentages.map((markup) => (
                    <div key={markup} className="bg-secondary/20 px-2 py-1 text-sm">
                      {markup}%
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-black button-sharp">
                CALCULATE PRICES
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Button
          onClick={() => setActiveView("table")}
          className={`gangster-font ${
            activeView === "table"
              ? "bg-gold hover:bg-gold/90 text-black"
              : "bg-transparent border border-gold text-gold hover:bg-gold/10"
          } button-sharp`}
        >
          PRICE TABLE
        </Button>
        <Button
          onClick={() => setActiveView("charts")}
          className={`gangster-font ${
            activeView === "charts"
              ? "bg-gold hover:bg-gold/90 text-black"
              : "bg-transparent border border-gold text-gold hover:bg-gold/10"
          } button-sharp`}
        >
          PRICE CHARTS
        </Button>
      </div>

      {activeView === "table" ? (
        <Card className="card-hover card-sharp border-gold">
          <CardContent className="pt-6">
            <PriceTable
              pricePoints={localPricePoints}
              onSelectPricePoint={handlePricePointSelect}
              selectedPricePointId={localSelectedPricePointId || ""}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="card-hover card-sharp border-gold">
          <CardContent className="pt-6">
            <PriceCharts pricePoints={localPricePoints} />
          </CardContent>
        </Card>
      )}

      {selectedPricePoint && (
        <Card className="card-hover card-sharp border-gold">
          <CardHeader>
            <CardTitle className="gangster-font text-gold">SELECTED PRICE POINT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground gangster-font">MARKUP PERCENTAGE</p>
                <p className="text-xl font-bold mt-1 gold-text">{selectedPricePoint.markupPercentage}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground gangster-font">RETAIL PRICE (PER GRAM)</p>
                <p className="text-xl font-bold mt-1 gold-text">
                  {formatCurrency(selectedPricePoint.retailPricePerGram)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground gangster-font">MONTHLY REVENUE</p>
                <p className="text-xl font-bold mt-1 gold-text">{formatCurrency(selectedPricePoint.monthlyRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground gangster-font">MONTHLY PROFIT</p>
                <p className="text-xl font-bold mt-1 money-text">{formatCurrency(selectedPricePoint.monthlyProfit)}</p>
              </div>
            </div>

            <div className="bg-smoke p-4">
              <h3 className="font-medium gangster-font mb-2">PRICING RECOMMENDATION</h3>
              <p className="text-sm">
                {selectedPricePoint.markupPercentage > 120
                  ? "Premium pricing strategy. High margins but may limit volume. Best for exclusive products or loyal customer base."
                  : selectedPricePoint.markupPercentage > 80
                    ? "Balanced pricing strategy. Good margins with reasonable volume. Recommended for most businesses."
                    : "Value pricing strategy. Lower margins but potentially higher volume. Consider if you need to build market share."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
