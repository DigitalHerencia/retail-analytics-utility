"use client"

import { useActionState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { saveBusinessData } from "@/lib/actions/saveBusinessData"
import type { BusinessData, InventoryItem, Customer, Transaction } from "@/types"
import { useFormStatus } from "react-dom"
import React from "react"

const formSchema = z.object({
  wholesalePricePerOz: z.coerce.number().nonnegative("Price must be non-negative"),
  targetProfitPerMonth: z.coerce.number().nonnegative("Target profit must be non-negative"),
  operatingExpenses: z.coerce.number().nonnegative("Operating expenses must be non-negative"),
})

interface RetailAnalyticsFormProps {
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  transactions: Transaction[]
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-white hover:bg-white/90 text-black button-sharp font-medium"
    >
      {pending ? "Updating..." : "Update Business Settings"}
    </Button>
  )
}

export function RetailAnalyticsForm({
  businessData,
  inventory,
  customers,
  transactions
}: RetailAnalyticsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wholesalePricePerOz: businessData.wholesalePricePerOz,
      targetProfitPerMonth: businessData.targetProfitPerMonth,
      operatingExpenses: businessData.operatingExpenses,
    },
  })

  // Define the state type for useActionState
  type ActionState = { success: boolean; error?: string } | { error: string; success?: boolean };

  // Server action state
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData) => {
      const userId = "testUserId" // TODO: Replace with actual user/tenant id
      const values = {
        wholesalePricePerOz: Number(formData.get("wholesalePricePerOz")),
        targetProfitPerMonth: Number(formData.get("targetProfitPerMonth")),
        operatingExpenses: Number(formData.get("operatingExpenses")),
        targetProfit: 0,
      }
      try {
        await saveBusinessData(userId, values)
        return { success: true }
      } catch (e) {
        return { error: "Failed to update business settings" }
      }
    },
    { success: false }
  )

  React.useEffect(() => {
    if (businessData) {
      form.setValue("wholesalePricePerOz", businessData.wholesalePricePerOz)
      form.setValue("targetProfitPerMonth", businessData.targetProfitPerMonth)
      form.setValue("operatingExpenses", businessData.operatingExpenses)
    }
  }, [businessData, form.setValue])

  // Calculate business metrics
  const totalRevenue = transactions
    .filter(t => t.type === "sale")
    .reduce((sum, t) => sum + t.totalPrice, 0)

  const totalProfit = transactions
    .filter(t => t.type === "sale")
    .reduce((sum, t) => sum + t.profit, 0)

  const totalExpenses = businessData.operatingExpenses +
    inventory.reduce((sum, item) => sum + (item.quantityOz * item.costPerOz), 0)

  const profitMargin = totalRevenue > 0
    ? ((totalProfit / totalRevenue) * 100).toFixed(2)
    : "0.00"

  return (
    <Card className="border-white/20 card-sharp">
      <CardHeader>
        <CardTitle className="gangster-font text-white">BUSINESS SETTINGS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-black/20 rounded-md">
            <p className="text-sm text-white/70">Revenue</p>
            <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-md">
            <p className="text-sm text-white/70">Expenses</p>
            <p className="text-2xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-md">
            <p className="text-sm text-white/70">Profit Margin</p>
            <p className="text-2xl font-bold text-white">{profitMargin}%</p>
          </div>
        </div>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="wholesalePricePerOz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">WHOLESALE PRICE PER OZ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        className="input-sharp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetProfitPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">TARGET MONTHLY PROFIT</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        className="input-sharp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operatingExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">OPERATING EXPENSES</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        className="input-sharp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SubmitButton />
            {state?.error && (
              <div className="text-red-500 text-sm mt-2">{state.error}</div>
            )}
            {state?.success && (
              <div className="text-green-500 text-sm mt-2">Business settings updated successfully.</div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
