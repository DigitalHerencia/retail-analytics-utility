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
import type { ScenarioData } from "@/types"
import { generateScenarios } from "@/lib/actions/generateScenarios"

import { useFormStatus } from 'react-dom'
import { formatCurrency } from "@/lib/utils"

const formSchema = z.object({
  basePrice: z.coerce.number().positive("Base price must be positive"),
  priceIncrement: z.coerce.number().positive("Price increment must be positive"),
  grossMarginPercentage: z.coerce
    .number()
    .min(1, "Margin must be at least 1%")
    .max(99, "Margin must be less than 100%"),
  targetProfit: z.coerce.number().positive("Target profit must be positive"),
})

interface PriceGeneratorProps {
  onGenerate: (scenarios: ScenarioData[]) => void
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="bg-white hover:bg-white/90 text-black button-sharp border-white">
      {pending ? "Generating..." : "GENERATE SCENARIOS"}
    </Button>
  )
}

export default function PriceGenerator({ onGenerate }: PriceGeneratorProps) {
  const [previewScenarios, setPreviewScenarios] = useState<Array<{ price: number; margin: number }>>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePrice: 20,
      priceIncrement: 1,
      grossMarginPercentage: 60,
      targetProfit: 2000,
    },
  })

  const watchBasePrice = form.watch("basePrice")
  const watchPriceIncrement = form.watch("priceIncrement")
  const watchGrossMarginPercentage = form.watch("grossMarginPercentage")

  // Update preview whenever inputs change
  const updatePreview = () => {
    const basePrice = watchBasePrice || 20
    const priceIncrement = watchPriceIncrement || 1
    const marginPercentage = watchGrossMarginPercentage || 60
    const scenarios = []
    for (let i = 5; i > 0; i--) {
      const price = Math.max(basePrice - i * priceIncrement, priceIncrement)
      const margin = (price * marginPercentage) / 100
      scenarios.push({ price, margin })
    }
    scenarios.push({
      price: basePrice,
      margin: (basePrice * marginPercentage) / 100,
    })
    for (let i = 1; i <= 5; i++) {
      const price = basePrice + i * priceIncrement
      const margin = (price * marginPercentage) / 100
      scenarios.push({ price, margin })
    }
    setPreviewScenarios(scenarios)
  }
  useState(() => {
    const subscription = form.watch(() => updatePreview())
    updatePreview()
    return () => subscription.unsubscribe()
  })

  // Server action state for scenario generation
  const [state, formAction] = useActionState<
    { success: boolean; error?: string },
    FormData
  >(
    async (prevState: { success: boolean; error?: string }, formData: FormData) => {
      try {
        const scenarios = await generateScenarios(formData)
        onGenerate(scenarios)
        return { success: true, error: undefined }
      } catch (e) {
        return { success: false, error: "Failed to generate scenarios" }
      }
    },
    { success: false, error: undefined },
  )

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">BASE PRICE (PER GRAM)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="1" className="input-sharp" {...field} />
                  </FormControl>
                  <FormDescription>The center price point</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceIncrement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">PRICE INCREMENT</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" className="input-sharp" {...field} />
                  </FormControl>
                  <FormDescription>Amount to increase/decrease for each price point</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grossMarginPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">GROSS MARGIN: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      min={1}
                      max={99}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-2"
                    />
                  </FormControl>
                  <FormDescription>Percentage of price that is profit</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetProfit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">TARGET MONTHLY PROFIT</FormLabel>
                  <FormControl>
                    <Input type="number" step="100" min="100" className="input-sharp" {...field} />
                  </FormControl>
                  <FormDescription>Your target monthly profit before sales commissions</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium gangster-font">PREVIEW OF PRICE POINTS</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {previewScenarios.map((scenario, index) => (
                <div
                  key={index}
                  className={`p-2 border rounded-md text-center card-sharp ${
                    index === 5 ? "border-white bg-white/10" : "border-white/50"
                  }`}
                >
                  <div className="font-medium">{formatCurrency(scenario.price)}</div>
                  <div className="text-xs text-muted-foreground">Margin: {formatCurrency(scenario.margin)}</div>
                </div>
              ))}
            </div>
          </div>
          <SubmitButton />
          {state?.error && (
            <div className="text-red-500 text-sm mt-2">{state.error}</div>
          )}
          {state?.success && (
            <div className="text-green-500 text-sm mt-2">Scenarios generated successfully.</div>
          )}
        </form>
      </Form>
    </div>
  )
}
