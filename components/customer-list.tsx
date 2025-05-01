"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, AlertTriangle } from "lucide-react"
import type { Customer } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

interface CustomerListProps {
  customers: Customer[]
  onSelectCustomer: (customer: Customer) => void
}

export default function CustomerList({ customers, onSelectCustomer }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "unpaid" | "overdue" | "paid">("all")

  // Filter and search customers
  const filteredCustomers = customers.filter((customer) => {
    // Apply search
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply filter
    if (filter === "all") return matchesSearch
    if (filter === "paid") return matchesSearch && customer.status === "paid"
    if (filter === "unpaid") return matchesSearch && (customer.status === "unpaid" || customer.status === "partial")
    if (filter === "overdue") {
      const dueDate = new Date(customer.dueDate)
      const today = new Date()
      return matchesSearch && (customer.status === "unpaid" || customer.status === "partial") && dueDate < today
    }

    return matchesSearch
  })

  // Sort customers: overdue first, then unpaid, then paid
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    // First sort by status
    if (a.status !== b.status) {
      if (a.status === "unpaid" && new Date(a.dueDate) < new Date()) return -1
      if (b.status === "unpaid" && new Date(b.dueDate) < new Date()) return 1
      if (a.status === "unpaid") return -1
      if (b.status === "unpaid") return 1
      if (a.status === "partial") return -1
      if (b.status === "partial") return 1
    }

    // Then sort by due date for unpaid/partial
    if ((a.status === "unpaid" || a.status === "partial") && (b.status === "unpaid" || b.status === "partial")) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }

    // Then sort by name
    return a.name.localeCompare(b.name)
  })

  // Count overdue customers
  const overdueCount = customers.filter(
    (c) => (c.status === "unpaid" || c.status === "partial") && new Date(c.dueDate) < new Date(),
  ).length

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-sharp"
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-white text-black hover:bg-white/90 button-sharp" : "button-sharp"}
        >
          All ({customers.length})
        </Button>
        <Button
          variant={filter === "unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unpaid")}
          className={filter === "unpaid" ? "bg-white text-black hover:bg-white/90 button-sharp" : "button-sharp"}
        >
          Unpaid ({customers.filter((c) => c.status === "unpaid" || c.status === "partial").length})
        </Button>
        <Button
          variant={filter === "overdue" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("overdue")}
          className={filter === "overdue" ? "bg-blood text-white hover:bg-blood/90 button-sharp" : "button-sharp"}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue ({overdueCount})
        </Button>
        <Button
          variant={filter === "paid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("paid")}
          className={filter === "paid" ? "bg-white text-black hover:bg-white/90 button-sharp" : "button-sharp"}
        >
          Paid ({customers.filter((c) => c.status === "paid").length})
        </Button>
      </div>

      {sortedCustomers.length === 0 ? (
        <div className="text-center py-12 bg-smoke">
          <p className="text-muted-foreground">No clients found</p>
          {searchTerm && <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="overflow-hidden card-hover card-sharp border-white cursor-pointer"
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium gangster-font">{customer.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(customer.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {customer.status === "paid" ? (
                      <Badge className="bg-white text-black hover:bg-white/90 border border-white rounded-none">
                        PAID
                      </Badge>
                    ) : customer.status === "partial" ? (
                      <Badge className="bg-white text-black hover:bg-white/90 border border-white rounded-none">
                        PARTIAL
                      </Badge>
                    ) : new Date(customer.dueDate) < new Date() ? (
                      <Badge className="bg-blood text-white hover:bg-blood/90 border border-blood rounded-none">
                        OVERDUE
                      </Badge>
                    ) : (
                      <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary rounded-none">
                        UPCOMING
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Amount: {formatCurrency(customer.amountOwed)}</span>
                  {customer.phone && <span className="text-muted-foreground">{customer.phone}</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
