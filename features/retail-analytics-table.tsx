"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { InventoryItem, Customer, Transaction } from "@/types"

interface RetailAnalyticsTableProps {
  transactions: Transaction[]
  customers: Customer[]
  inventory: InventoryItem[]
}

type SortKey = "date" | "type" | "amount" | "profit"
type SortOrder = "asc" | "desc"

export function RetailAnalyticsTable({
  transactions,
  customers,
  inventory
}: RetailAnalyticsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState<"all" | "sale" | "payment">("all")
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Filter transactions
  const filteredTransactions = transactions
    .filter(t => {
      if (transactionType !== "all" && t.type !== transactionType) return false
      
      const searchLower = searchQuery.toLowerCase()
      return (
        t.type.toLowerCase().includes(searchLower) ||
        t.inventoryName?.toLowerCase().includes(searchLower) ||
        t.customerName?.toLowerCase().includes(searchLower) ||
        t.paymentMethod?.toLowerCase().includes(searchLower) ||
        t.notes?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
        case "amount":
          comparison = a.totalPrice - b.totalPrice
          break
        case "profit":
          comparison = (a.profit || 0) - (b.profit || 0)
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  return (
    <Card className="border-white/20 card-sharp">
      <CardHeader>
        <CardTitle className="gangster-font text-white">TRANSACTION HISTORY</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="gangster-font">SEARCH</Label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="input-sharp"
            />
          </div>

          <div className="space-y-2">
            <Label className="gangster-font">FILTER BY TYPE</Label>
            <Select
              value={transactionType}
              onValueChange={(value: "all" | "sale" | "payment") => setTransactionType(value)}
            >
              <SelectTrigger className="input-sharp">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="sale">Sales Only</SelectItem>
                <SelectItem value="payment">Payments Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[400px] rounded-md border border-white/20">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-white/5"
                    onClick={() => toggleSort("date")}
                  >
                    Date {sortKey === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-white/5"
                    onClick={() => toggleSort("type")}
                  >
                    Type {sortKey === "type" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-3 text-left">Details</th>
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-white/5"
                    onClick={() => toggleSort("amount")}
                  >
                    Amount {sortKey === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-white/5"
                    onClick={() => toggleSort("profit")}
                  >
                    Profit {sortKey === "profit" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/20 hover:bg-white/5"
                  >
                    <td className="p-3">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 capitalize">{transaction.type}</td>
                    <td className="p-3">
                      {transaction.type === "sale" ? (
                        <>
                          {transaction.inventoryName} ({transaction.quantityGrams.toFixed(2)}g @ ${transaction.pricePerGram}/g)
                          {transaction.customerName && <><br /><span className="text-sm text-white/70">Customer: {transaction.customerName}</span></>}
                        </>
                      ) : (
                        <>
                          Payment via {transaction.paymentMethod}
                          {transaction.customerName && <><br /><span className="text-sm text-white/70">From: {transaction.customerName}</span></>}
                        </>
                      )}
                      {transaction.notes && (
                        <div className="text-sm text-white/70 mt-1">
                          Note: {transaction.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3">${transaction.totalPrice.toFixed(2)}</td>
                    <td className="p-3">
                      {transaction.type === "sale" && (
                        <span className={transaction.profit >= 0 ? "text-green-400" : "text-red-400"}>
                          ${transaction.profit.toFixed(2)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
