"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { processTransaction } from "@/lib/actions/transactions"
import type { InventoryItem, Customer, Transaction } from "@/types"
import { gramsToOunces } from "@/lib/utils"

interface CashRegisterProps {
  inventory: InventoryItem[]
  customers: Customer[]
  initialTransactions: Transaction[]
}

export function CashRegister({ inventory, customers, initialTransactions }: CashRegisterProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [pricePerGram, setPricePerGram] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [notes, setNotes] = useState("")
  const [transactions, setTransactions] = useState(initialTransactions)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const total = quantity * pricePerGram
  const cost = selectedItem ? (quantity / 28.3495) * selectedItem.costPerOz : 0
  const profit = total - cost

  async function handleProcessSale() {
    if (!selectedItem) {
      toast.error("Please select a product")
      return
    }

    // TODO: Replace with actual tenantId from context or props
    const tenantId = selectedItem.tenantId

    try {
      const transaction: Omit<Transaction, "id" | "createdAt"> = {
        tenantId,
        date: new Date().toISOString(),
        type: "sale",
        inventoryId: selectedItem.id,
        inventoryName: selectedItem.name,
        quantityGrams: quantity,
        pricePerGram,
        totalPrice: total,
        cost,
        profit,
        paymentMethod,
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || null,
        notes,
      }

      // Optimistic update
      const optimisticTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      setTransactions(prev => [optimisticTransaction, ...prev])

      // Clear form
      setSelectedItem(null)
      setSelectedCustomer(null)
      setQuantity(0)
      setPricePerGram(0)
      setNotes("")

      startTransition(async () => {
        await processTransaction(transaction)
        router.refresh()
        toast.success("Sale processed successfully")
      })
    } catch (error) {
      console.error("Error processing sale:", error)
      toast.error("Failed to process sale")
      // Revert optimistic update
      setTransactions(initialTransactions)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/20 card-sharp">
        <CardHeader>
          <CardTitle className="gangster-font text-white">PROCESS SALE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="gangster-font">PRODUCT</Label>
              <Select
                value={selectedItem?.id || ""}
                onValueChange={(value) => {
                  const item = inventory.find((i) => i.id === value)
                  setSelectedItem(item || null)
                }}
              >
                <SelectTrigger className="input-sharp">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.quantityG.toFixed(2)}g available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="gangster-font">CUSTOMER (OPTIONAL)</Label>
              <Select
                value={selectedCustomer?.id || ""}
                onValueChange={(value) => {
                  const customer = customers.find((c) => c.id === value)
                  setSelectedCustomer(customer || null)
                }}
              >
                <SelectTrigger className="input-sharp">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="gangster-font">QUANTITY (GRAMS)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="input-sharp"
              />
            </div>

            <div className="space-y-2">
              <Label className="gangster-font">PRICE PER GRAM</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={pricePerGram}
                onChange={(e) => setPricePerGram(parseFloat(e.target.value) || 0)}
                className="input-sharp"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="gangster-font">PAYMENT METHOD</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="input-sharp">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="gangster-font">NOTES (OPTIONAL)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-sharp"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/20 p-4 rounded-md">
            <div>
              <Label className="gangster-font">TOTAL</Label>
              <p className="text-2xl font-bold text-white">${total.toFixed(2)}</p>
            </div>
            <div>
              <Label className="gangster-font">COST</Label>
              <p className="text-2xl font-bold text-white">${cost.toFixed(2)}</p>
            </div>
            <div>
              <Label className="gangster-font">PROFIT</Label>
              <p className="text-2xl font-bold text-white">${profit.toFixed(2)}</p>
            </div>
          </div>

          <Button
            onClick={handleProcessSale}
            disabled={!selectedItem || quantity <= 0 || pricePerGram <= 0 || isPending}
            className="w-full bg-white hover:bg-white/90 text-black button-sharp font-medium"
          >
            Process Sale
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/20 card-sharp">
        <CardHeader>
          <CardTitle className="gangster-font text-white">RECENT TRANSACTIONS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-black/20 rounded-md"
              >
                <div className="flex items-center space-x-4">
                  <DollarSign className="h-5 w-5 text-white/70" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {transaction.inventoryName || "Payment"} - ${transaction.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/70">
                      {transaction.type === "sale"
                        ? `${transaction.quantityGrams.toFixed(2)}g @ $${transaction.pricePerGram}/g`
                        : `Payment via ${transaction.paymentMethod}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-white/70" />
                  <p className="text-sm text-white/70">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
