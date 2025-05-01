"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import PriceTable from "@/components/price-table"
import PriceCharts from "@/components/price-charts"
import { calculatePricePoints } from "@/lib/utils"
import { defaultMarkupPercentages, type PricePoint, type BusinessData } from "@/lib/data"

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wholesalePrice: 10,
      unit: "gram",
      targetProfit: businessData?.targetProfitPerMonth || 2000,
    },
  })

  // Update form when businessData changes
  useEffect(() => {
    if (businessData?.targetProfitPerMonth) {
      form.setValue("targetProfit", businessData.targetProfitPerMonth)
    }
  }, [businessData, form])

  // Calculate price points when form values change
  const calculatePrices = (data: z.infer<typeof formSchema>) => {
    const { wholesalePrice, unit, targetProfit } = data
    const businessDataForCalculation: BusinessData = {
      targetProfitPerMonth: targetProfit,
      targetProfit: 0, // Provide a default value
      wholesalePricePerOz: 0, // Provide a default value
      operatingExpenses: 0, // Provide a default value
    };
    const newPricePoints = calculatePricePoints(
      markupPercentages,
      wholesalePrice,
      businessDataForCalculation
    )
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
      <Card>
        <CardHeader>
          <CardTitle>Retail Pricing Tool</CardTitle>
          <CardDescription>
            Calculate retail prices based on wholesale cost and analyze profit at different markup levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculatePrices)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="wholesalePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wholesale Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" {...field} />
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
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
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
                  <FormItem>
                    <FormLabel>Target Monthly Net Profit</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" min="100" {...field} />
                    </FormControl>
                    <FormDescription>Your target monthly profit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-3">
                <Button type="submit">Calculate Prices</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Price Table</TabsTrigger>
          <TabsTrigger value="charts">Price Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              <PriceTable
                pricePoints={localPricePoints}
                onSelectPricePoint={handlePricePointSelect}
                selectedPricePointId={localSelectedPricePointId || ""}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardContent className="pt-6">
              <PriceCharts pricePoints={localPricePoints} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
