"use client"

import { useState } from "react"
import { useActionState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ScenarioData } from "@/types"
import { generateScenarios } from "@/lib/actions/generateScenarios"

import { useFormStatus } from 'react-dom'
import { formatCurrency } from "@/lib/utils"
import { Loader2, Calculator } from "lucide-react"
import { HustleTip } from "@/components/hustle-tip"

const formSchema = z.object({
  costPrice: z.coerce.number().positive("Cost price must be positive"),
  markup: z.coerce.number().positive("Markup percentage must be positive"),
})

export function PriceGenerator() {
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [profit, setProfit] = useState<number | null>(null)
  const [roi, setRoi] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costPrice: 0,
      markup: 0,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const price = values.costPrice + (values.costPrice * values.markup) / 100
    const profitValue = price - values.costPrice
    const roiValue = (profitValue / values.costPrice) * 100
    setCalculatedPrice(price)
    setProfit(profitValue)
    setRoi(roiValue)
  }

  return (
    <Card className="card-sharp border-white bg-black/50">
      <CardHeader>
        <CardTitle className="gangster-font text-white">PRICE CALCULATOR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Cost Price</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      className="bg-black/80 border-white text-white placeholder-white/60 input-sharp"
                      placeholder="Enter cost price..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="markup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Markup Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      className="bg-black/80 border-white text-white placeholder-white/60 input-sharp"
                      placeholder="Enter markup percentage..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-white text-black font-bold hover:bg-white/80 button-sharp">
              Calculate Price
            </Button>
          </form>
        </Form>

        {calculatedPrice && (
          <Card className="card-sharp border-white bg-black/80 mt-4">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-white/70">RECOMMENDED PRICE</p>
                <p className="text-3xl font-bold text-white money-text text-shadow">${calculatedPrice}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-white/70">PROFIT</p>
                    <p className="text-lg font-semibold text-money">${profit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">ROI</p>
                    <p className="text-lg font-semibold text-money">{roi}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <HustleTip title="PRICING TIP">
          Keep your prices competitive but don't undervalue your product. A higher price can sometimes increase perceived value and attract better customers.
        </HustleTip>
      </CardContent>
    </Card>
  )
}
