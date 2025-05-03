"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Plus, Minus, ShoppingCart, Save } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { formatCurrency, formatGrams, formatOunces, gramsToOunces, ouncesToGrams } from "@/lib/utils"
import { HustleTip } from "@/components/hustle-tip"
import { HustleStat } from "@/components/hustle-stat"
import type { Customer, InventoryItem, Payment, Transaction } from "@/types"

interface CashRegisterProps {
  inventory: InventoryItem[]
  customers: Customer[]
  retailPricePerGram: number
  onUpdateInventory: (inventory: InventoryItem[]) => void
  onUpdateCustomers: (customers: Customer[]) => void
  onAddTransaction: (transaction: Transaction) => void
}

export default function CashRegister({
  inventory = [],
  customers = [],
  retailPricePerGram,
  onUpdateInventory,
  onUpdateCustomers,
  onAddTransaction,
}: CashRegisterProps) {
  const [activeTab, setActiveTab] = useState("quick-sale")
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customPrice, setCustomPrice] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [dailyRevenue, setDailyRevenue] = useState(0)
  const [dailyTransactions, setDailyTransactions] = useState(0)
  const [dailyProfit, setDailyProfit] = useState(0)

  // Get selected inventory item
  const selectedInventory = selectedInventoryId ? inventory.find((item) => item.id === selectedInventoryId) : null

  // Get selected customer
  const selectedCustomer = selectedCustomerId ? customers.find((customer) => customer.id === selectedCustomerId) : null

  // Calculate sale price
  const calculateSalePrice = () => {
    if (customPrice !== null) return customPrice

    const pricePerGram = retailPricePerGram
    return pricePerGram * quantity
  }

  // Calculate cost
  const calculateCost = () => {
    if (!selectedInventory) return 0

    const costPerGram = selectedInventory.costPerOz / 28.35
    return costPerGram * quantity
  }

  // Calculate profit
  const calculateProfit = () => {
    return calculateSalePrice() - calculateCost()
  }

  // Handle quick sale
  const handleQuickSale = () => {
    if (!selectedInventory) return

    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type: "sale",
      inventoryId: selectedInventory.id,
      inventoryName: selectedInventory.name,
      quantityGrams: quantity,
      pricePerGram: calculateSalePrice() / quantity,
      totalPrice: calculateSalePrice(),
      cost: calculateCost(),
      profit: calculateProfit(),
      paymentMethod: paymentMethod,
      customerId: selectedCustomer?.id || null,
      customerName: selectedCustomer?.name || null,
      notes: notes,
      createdAt: new Date().toISOString(),
      tenantId: ""
    }

    // Update inventory
    const updatedInventory = inventory.map((item) => {
      if (item.id === selectedInventory.id) {
        const ouncesToDeplete = gramsToOunces(quantity)
        const newQuantityOz = Math.max(0, item.quantityOz - ouncesToDeplete)
        const newTotalCost = newQuantityOz * item.costPerOz

        return {
          ...item,
          quantityOz: newQuantityOz,
          totalCost: newTotalCost,
        }
      }
      return item
    })

    // If customer is selected and not paying cash, add to their account
    let updatedCustomers = [...customers]
    if (selectedCustomer && paymentMethod === "credit") {
      updatedCustomers = customers.map((customer) => {
        if (customer.id === selectedCustomer.id) {
          return {
            ...customer,
            amountOwed: customer.amountOwed + calculateSalePrice(),
            status: "unpaid",
            updatedAt: new Date().toISOString(),
          }
        }
        return customer
      })
    }

    // Update daily stats
    setDailyRevenue((prev) => prev + calculateSalePrice())
    setDailyTransactions((prev) => prev + 1)
    setDailyProfit((prev) => prev + calculateProfit())

    // Save changes
    onUpdateInventory(updatedInventory)
    onUpdateCustomers(updatedCustomers)
    onAddTransaction(transaction)

    // Reset form for next sale
    setSelectedInventoryId(null) // Reset selected product
    setQuantity(1)
    setCustomPrice(null)
    setNotes("")
    setPaymentMethod("cash") // Reset payment method
  }

  // Handle customer payment
  const handleCustomerPayment = () => {
    if (!selectedCustomer) return

    const paymentAmount = customPrice || selectedCustomer.amountOwed

    if (paymentAmount <= 0) return

    // Create payment record
    const payment: Payment = {
      id: uuidv4(),
      amount: paymentAmount,
      date: new Date().toISOString().split("T")[0],
      method: paymentMethod,
      notes: notes,
      createdAt: new Date().toISOString(),
    }

    // Calculate remaining amount after payment
    const newAmountOwed = Math.max(0, selectedCustomer.amountOwed - paymentAmount)

    // Determine new status
    let newStatus: "paid" | "partial" | "unpaid" = "unpaid"
    if (newAmountOwed === 0) {
      newStatus = "paid"
    } else if (paymentAmount > 0) {
      newStatus = "partial"
    }

    // Update customer
    const updatedCustomers = customers.map((customer) => {
      if (customer.id === selectedCustomer.id) {
        return {
          ...customer,
          amountOwed: newAmountOwed,
          status: newStatus,
          paymentHistory: [...customer.paymentHistory, payment],
          updatedAt: new Date().toISOString(),
        }
      }
      return customer
    })

    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type: "payment",
      inventoryId: null,
      inventoryName: null,
      quantityGrams: 0,
      pricePerGram: 0,
      totalPrice: paymentAmount,
      cost: 0,
      profit: 0,
      paymentMethod: paymentMethod,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      notes: notes,
      createdAt: new Date().toISOString(),
      tenantId: ""
    }

    // Update daily stats
    setDailyRevenue((prev) => prev + paymentAmount)
    setDailyTransactions((prev) => prev + 1)

    // Save changes
    onUpdateCustomers(updatedCustomers)
    onAddTransaction(transaction)

    // Reset form after payment
    setCustomPrice(null)
    setNotes("")
    setSelectedCustomerId(null) // Reset selected customer after payment
    setPaymentMethod("cash") // Reset payment method
  }

  // Reset daily stats at midnight
  useEffect(() => {
    const now = new Date()
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
       0, // hour
       0, // minute
       0 // second
    )
    const msToMidnight = night.getTime() - now.getTime()

    const timer = setTimeout(() => {
      setDailyRevenue(0)
      setDailyTransactions(0)
      setDailyProfit(0)
    }, msToMidnight)

    return () => clearTimeout(timer)
  }, [dailyRevenue, dailyTransactions, dailyProfit])

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">CASH REGISTER</h1>
          <p className="text-white/80 mt-1">MOVE PRODUCT. COLLECT MONEY. STACK PAPER.</p>
        </div>

        <HustleTip title="QUICK TRANSACTIONS">
          <p>
            Use this page for your day-to-day business. Record sales, collect payments, and keep your inventory
            accurate. Every transaction is tracked for your monthly reports.
          </p>
        </HustleTip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="TODAY'S REVENUE"
          value={formatCurrency(dailyRevenue)}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="TODAY'S PROFIT"
          value={formatCurrency(dailyProfit)}
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="TRANSACTIONS"
          value={dailyTransactions.toString()}
          icon={<Save className="h-5 w-5 text-white" />}
          className="border-white"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border rounded-md border-white bg-black p-0 mb-4 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 gap-0 bg-transparent p-0 overflow-hidden">
            <TabsTrigger
              value="quick-sale"
              className="gangster-font text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-3 font-bold transition-colors data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:focus-visible:outline-none"
              style={{ borderBottom: '2px solid transparent' }}
            >
              QUICK SALE
            </TabsTrigger>
            <TabsTrigger
              value="collect-payment"
              className="gangster-font text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-3 font-bold transition-colors data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:focus-visible:outline-none"
              style={{ borderBottom: '2px solid transparent' }}
            >
              COLLECT PAYMENT
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quick-sale" className="space-y-4 mt-4 px-1 sm:px-0">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">PRODUCT SALE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="gangster-font">SELECT PRODUCT</Label>
                <Select value={selectedInventoryId || ""} onValueChange={setSelectedInventoryId}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory && inventory.length > 0 ? (
                      inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id} disabled={item.quantityOz <= 0}>
                          {item.name} ({formatOunces(item.quantityOz)})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-inventory" disabled>
                        No inventory available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">QUANTITY (GRAMS)</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white text-white hover:bg-white/10 button-sharp"
                    onClick={() => setQuantity(Math.max(0.2, quantity - 0.2))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    step="0.1"
                    min="0.1"
                    className="input-sharp text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white text-white hover:bg-white/10 button-sharp"
                    onClick={() => setQuantity(quantity + 0.2)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedInventory && (
                  <p className="text-xs text-muted-foreground">
                    Max available: {formatGrams(ouncesToGrams(selectedInventory.quantityOz))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">CLIENT (OPTIONAL)</Label>
                <Select value={selectedCustomerId || "none"} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue placeholder="Select client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {customers && customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-customers" disabled>
                        No customers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">PRICE</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={customPrice !== null ? customPrice : calculateSalePrice()}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className="input-sharp"
                  />
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 button-sharp whitespace-nowrap"
                    onClick={() => setCustomPrice(null)}
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Standard price: {formatCurrency(retailPricePerGram)} per gram
                </p>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">PAYMENT METHOD</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit" disabled={!selectedCustomer || selectedCustomerId === "none"}>
                      Add to Client Account
                    </SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="gangster-font">NOTES (OPTIONAL)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-sharp"
                  placeholder="Add notes about this sale..."
                />
              </div>

              <div className="bg-smoke p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="gangster-font">TOTAL PRICE:</span>
                  <span className="font-bold text-white">{formatCurrency(calculateSalePrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="gangster-font">COST:</span>
                  <span className="text-white">{formatCurrency(calculateCost())}</span>
                </div>
                <div className="flex justify-between border-t border-white pt-2 mt-2">
                  <span className="gangster-font">PROFIT:</span>
                  <span className="font-bold text-white">{formatCurrency(calculateProfit())}</span>
                </div>
              </div>

              <Button
                onClick={handleQuickSale}
                disabled={
                  !selectedInventory ||
                  quantity <= 0 ||
                  (selectedInventory && quantity > ouncesToGrams(selectedInventory.quantityOz))
                }
                className="w-full bg-white hover:bg-white/90 text-black button-sharp border-white"
              >
                COMPLETE SALE
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collect-payment" className="space-y-4 mt-4 px-1 sm:px-0">
          <Card className="card-sharp border-white">
            <CardHeader>
              <CardTitle className="gangster-font text-white">COLLECT PAYMENT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="gangster-font">SELECT CLIENT</Label>
                <Select value={selectedCustomerId || ""} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="input-sharp">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers && customers.length > 0 ? (
                      customers
                        .filter((c) => c.amountOwed > 0)
                        .map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({formatCurrency(customer.amountOwed)})
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-customers" disabled>
                        No customers with outstanding balances
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && selectedCustomer.amountOwed > 0 && (
                <>
                  <div className="bg-smoke p-4">
                    <div className="flex justify-between items-center">
                      <span className="gangster-font">AMOUNT OWED:</span>
                      <span className="text-white font-bold">{formatCurrency(selectedCustomer.amountOwed)}</span>
                    </div>
                    <div className="text-xs text-white mt-1">
                      Due date: {new Date(selectedCustomer.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">PAYMENT AMOUNT</Label>
                    <Input
                      type="number"
                      value={customPrice !== null ? customPrice : selectedCustomer?.amountOwed || 0}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      step="0.01"
                      min="0"
                      max={selectedCustomer?.amountOwed || 0}
                      className="input-sharp"
                    />
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white text-white hover:bg-white/10 button-sharp"
                        onClick={() => selectedCustomer && setCustomPrice(selectedCustomer.amountOwed)}
                      >
                        Full Amount
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white text-white hover:bg-white/10 button-sharp"
                        onClick={() => selectedCustomer && setCustomPrice(selectedCustomer.amountOwed / 2)}
                      >
                        Half
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">PAYMENT METHOD</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="input-sharp">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">NOTES (OPTIONAL)</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-sharp"
                      placeholder="Add notes about this payment..."
                    />
                  </div>

                  <Button
                    onClick={handleCustomerPayment}
                    disabled={
                      !selectedCustomer ||
                      (customPrice !== null && (customPrice <= 0 || customPrice > (selectedCustomer?.amountOwed || 0)))
                    }
                    className="w-full bg-white hover:bg-white/90 text-black button-sharp border-white"
                  >
                    RECORD PAYMENT
                  </Button>
                </>
              )}

              {selectedCustomer && selectedCustomer.amountOwed === 0 && (
                <div className="bg-smoke p-6 text-center">
                  <p className="text-money gangster-font">THIS CLIENT HAS NO OUTSTANDING BALANCE</p>
                </div>
              )}

              {!selectedCustomer && (
                <div className="bg-smoke p-6 text-center">
                  <p className="text-muted-foreground">Select a client to collect payment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
