"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { processTransaction } from "@/lib/actions/transactions"
import type { Customer, InventoryItem } from "@/types"
import { useRouter } from "next/navigation"

interface CashRegisterClientProps {
  inventory: InventoryItem[]
  customers: Customer[]
}

export default function CashRegisterClient({ inventory = [], customers = [] }: CashRegisterClientProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [cart, setCart] = useState<{ item: InventoryItem; quantity: number }[]>([])
  const [quantity, setQuantity] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<string>("inventory")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function addToCart(item: InventoryItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
        )
      }
      return [...prev, { item, quantity }]
    })
    setQuantity(1)
  }

  return (
    <Card className="bg-black text-white border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Cash Register</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
            <TabsTrigger value="collect">Collect Payment</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory">
            <div className="space-y-2">
              {inventory.length === 0 && <div>No inventory available.</div>}
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center gap-2 mb-2">
                  <span className="flex-grow">{item.name}</span>
                  <span className="mr-2">{quantity}</span>
                  <Button size="icon" variant="outline" onClick={() => addToCart(item)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="cart">
            {/* Cart content similar to inventory but with cart items */}
          </TabsContent>
          <TabsContent value="collect">
            {/* Collect payment UI */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}