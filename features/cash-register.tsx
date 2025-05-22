"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HustleTip } from "@/components/hustle-tip"
import { HustleStat } from "@/components/hustle-stat"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DollarSign, Package, ArrowDown } from "lucide-react"
import type { InventoryItem, Customer, Transaction } from "@/types"
import { v4 as uuidv4 } from "uuid"

const formSchema = z.object({
  type: z.enum(["sale", "purchase", "payment"]),
  inventoryId: z.string().optional(),
  customerId: z.string().optional(),
  quantityGrams: z.coerce.number().min(0.1).optional(),
  pricePerGram: z.coerce.number().min(0.1).optional(),
  totalPrice: z.coerce.number().min(0.1),
  paymentMethod: z.enum(["cash", "credit", "other"]),
  notes: z.string().optional(),
})

interface CashRegisterProps {
  inventory: InventoryItem[]
  customers: Customer[]
  onUpdateInventory: (inventory: InventoryItem[]) => void
  onUpdateCustomers: (customers: Customer[]) => void
  onAddTransaction: (transaction: Transaction) => void
  retailPricePerGram: number
}

export default function CashRegister({
  inventory,
  customers,
  onUpdateInventory,
  onUpdateCustomers,
  onAddTransaction,
  retailPricePerGram
}: CashRegisterProps) {
  const [dailySales, setDailySales] = useState(0)
  const [itemsSold, setItemsSold] = useState(0)
  const [averageSale, setAverageSale] = useState(0)

  // Create form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "sale",
      quantityGrams: 1,
      pricePerGram: retailPricePerGram,
      totalPrice: retailPricePerGram, // Default to retail price * 1g
      paymentMethod: "cash",
      notes: "",
    },
  })

  // Update total price when quantity or price per gram changes
  const watchQuantity = form.watch("quantityGrams")
  const watchPrice = form.watch("pricePerGram")
  const watchType = form.watch("type")
  
  useEffect(() => {
    if (watchQuantity && watchPrice) {
      const total = watchQuantity * watchPrice
      form.setValue("totalPrice", parseFloat(total.toFixed(2)))
    }
  }, [watchQuantity, watchPrice, form])

  // Update price per gram when inventory item changes
  const watchInventoryId = form.watch("inventoryId")
  
  useEffect(() => {
    if (watchInventoryId && watchType === "sale") {
      const item = inventory.find(item => item.id === watchInventoryId)
      if (item) {
        // If item has a retail price, use it. Otherwise use the global retail price.
        const price = item.retailPrice > 0 ? item.retailPrice : retailPricePerGram
        form.setValue("pricePerGram", price)
      }
    }
  }, [watchInventoryId, watchType, inventory, retailPricePerGram, form])

  // Reset form fields based on transaction type
  useEffect(() => {
    if (watchType === "payment") {
      form.setValue("inventoryId", undefined)
      form.setValue("quantityGrams", undefined)
      form.setValue("pricePerGram", undefined)
    } else {
      form.setValue("quantityGrams", 1)
      form.setValue("pricePerGram", retailPricePerGram)
      form.setValue("totalPrice", retailPricePerGram)
    }
  }, [watchType, retailPricePerGram, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Build the transaction object
      const now = new Date()
      const customerId = values.customerId === 'none' ? null : values.customerId;
      const transaction: Transaction = {
        id: uuidv4(),
        date: format( now, "yyyy-MM-dd" ),
        type: values.type,
        inventoryId: values.inventoryId || null,
        inventoryName: values.inventoryId ?
          inventory.find( item => item.id === values.inventoryId )?.name || null : null,
        customerId: customerId || null,
        customerName: customerId ?
          customers.find( c => c.id === customerId )?.name || null : null,
        quantityGrams: values.quantityGrams || 0,
        pricePerGram: values.pricePerGram || 0,
        totalPrice: values.totalPrice,
        paymentMethod: values.paymentMethod,
        notes: values.notes || "",
        createdAt: now.toISOString(),
        tenantId: "",
        cost: 0,
        profit: 0
      }

      // Pass the transaction to the parent component for processing
      onAddTransaction(transaction)

      // Reset the form
      form.reset({
        type: "sale",
        quantityGrams: 1,
        pricePerGram: retailPricePerGram,
        totalPrice: retailPricePerGram,
        paymentMethod: "cash",
        notes: "",
      })
      
      // Update daily stats
      if (values.type === "sale") {
        setDailySales(prev => prev + values.totalPrice)
        setItemsSold(prev => prev + 1)
        setAverageSale((dailySales + values.totalPrice) / (itemsSold + 1))
      }
    } catch (error) {
      console.error("Error processing transaction:", error)
    }
  }

  return (
    <div className="container py-4 space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2 card-sharp fade-in">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">REGISTER</h1>
          <p className="text-white/80 mt-1">Organize the hustle. Encrypt the grind.</p>
        </div>
        <HustleTip title="REGISTER TIPS">
          <p>
            Record sales, purchases, and payments accurately. Select the correct transaction type, customer, and payment method.
            Add notes for additional details. Keep your register up-to-date for accurate tracking and reporting.
          </p>
        </HustleTip>
      </div>
      
        
        {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="TODAY'S SALES"
          value={`$${dailySales.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          className="card-hover"
        />
        <HustleStat
          title="ITEMS SOLD TODAY" 
          value={itemsSold.toString()}
          icon={<Package className="h-5 w-5 text-white" />}
          className="card-hover"
        />
        <HustleStat
          title="AVERAGE SALE"
          value={`$${averageSale.toFixed(2)}`}
          icon={<ArrowDown className="h-5 w-5 text-white" />}
          className="card-hover"
        />
      </div>

      <Card className="card-sharp border-white">
        <CardHeader className="border-b border-white/20 pb-4">
          <CardTitle className="text-2xl gangster-font text-white">New Transaction</CardTitle>
          <CardDescription>Record a new sale, purchase, or payment</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Transaction Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black border-white text-white card-sharp">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-black border-white text-white">
                          <SelectItem value="sale" className="hover:bg-white/10">Sale</SelectItem>
                          <SelectItem value="purchase" className="hover:bg-white/10">Purchase</SelectItem>
                          <SelectItem value="payment" className="hover:bg-white/10">Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-white/60">
                        Type of transaction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Customer</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black border-white text-white card-sharp">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-black border-white text-white">
                          <SelectItem value="none" className="hover:bg-white/10">None</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id} className="hover:bg-white/10">
                              {customer.name} (${customer.amountOwed?.toFixed(2) || "0.00"} owed)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-white/60">
                        Required for credit transactions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="quantityGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Quantity (grams)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} className="bg-black border-white text-white card-sharp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Total Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} className="bg-black border-white text-white card-sharp money-text font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Payment Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black border-white text-white card-sharp">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-black border-white text-white">
                          <SelectItem value="cash" className="hover:bg-white/10">Cash</SelectItem>
                          <SelectItem value="credit" className="hover:bg-white/10">Credit (On Account)</SelectItem>
                          <SelectItem value="other" className="hover:bg-white/10">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Notes (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black border-white text-white card-sharp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full card-sharp bg-white text-black hover:bg-white/90 text-lg font-bold">
                Complete Transaction
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}