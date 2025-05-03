"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CustomerForm from "@/features/customer-form"
import CustomerDetails from "@/features/customer-details"
import type { Customer, Payment } from "@/types"
import { createCustomer, updateCustomer, deleteCustomer, addCustomerPayment } from "@/lib/fetchers"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface CustomerListProps {
  initialCustomers: Customer[]
  tenantId: string // Add tenantId prop
}

export function CustomerList({ initialCustomers, tenantId }: CustomerListProps) { // Destructure tenantId
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()


  async function handleAddCustomer(customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) {
    try {
      // Optimistic update
      const optimisticCustomer = {
        ...customer,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCustomers(prev => [...prev, optimisticCustomer])
      setIsAddDialogOpen(false)
      startTransition(async () => {
        await createCustomer(tenantId, customer) // Pass tenantId
        router.refresh()
        toast.success("Customer added successfully")
        toast.success("Customer added successfully")
      })
    } catch (error) {
      console.error("Error adding customer:", error)
      toast.error("Failed to add customer")
      // Revert optimistic update
      setCustomers(prev => prev.filter(c => c.id !== crypto.randomUUID()))
    }
  }

  async function handleUpdateCustomer(customer: Customer) {
    try {
      // Optimistic update
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c))
      setSelectedCustomerId(null)
      startTransition(async () => {
        await updateCustomer(tenantId, customer) // Pass tenantId
        router.refresh()
        toast.success("Customer updated successfully")
        toast.success("Customer updated successfully")
      })
    } catch (error) {
      console.error("Error updating customer:", error)
      toast.error("Failed to update customer")
      // Revert optimistic update
      setCustomers(initialCustomers)
    }
  }

  async function handleDeleteCustomer(customerId: string) {
    try {
      // Optimistic update
      setCustomers(prev => prev.filter(c => c.id !== customerId))
      setSelectedCustomerId(null)
      startTransition(async () => {
        await deleteCustomer(tenantId, customerId) // Pass tenantId
        router.refresh()
        toast.success("Customer deleted successfully")
        toast.success("Customer deleted successfully")
      })
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Failed to delete customer")
      // Revert optimistic update
      setCustomers(initialCustomers)
    }
  }

  async function handleAddPayment(customerId: string, payment: Payment) {
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return

    try {
      // Optimistic update
      const updatedCustomer = {
        ...customer,
        paymentHistory: [...customer.paymentHistory, payment],
        amountOwed: Math.max(0, customer.amountOwed - payment.amount),
        status: (customer.amountOwed - payment.amount <= 0 ? "paid" : "partial") as Customer['status'],
        updatedAt: new Date().toISOString()
      }
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c))
      startTransition(async () => {
        await addCustomerPayment(tenantId, customerId, payment) // Pass tenantId
        router.refresh()
        toast.success("Payment added successfully")
        toast.success("Payment added successfully")
      })
    } catch (error) {
      console.error("Error adding payment:", error)
      toast.error("Failed to add payment")
      // Revert optimistic update
      setCustomers(initialCustomers)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {customers.map(customer => (
          <Card
            key={customer.id}
            className="cursor-pointer hover:bg-smoke/10 transition-colors card-sharp border-white/20"
            onClick={() => setSelectedCustomerId(customer.id)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="text-white">{customer.name}</span>
                <Badge
                  variant={customer.status === "paid" ? "default" : "destructive"}
                  className="uppercase"
                >
                  {customer.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p className="text-white/70">{customer.email}</p>
                <p className="text-white/70">{customer.phone}</p>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-white/70">Amount Owed:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(customer.amountOwed)}
                  </span>
                </div>
                {customer.dueDate && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white/70">Due Date:</span>
                    <span className="text-white font-medium">
                      {(() => {
                        // Try to parse as date, fallback to string
                        const d = new Date(customer.dueDate)
                        return isNaN(d.getTime()) ? customer.dueDate : d.toLocaleDateString()
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomerForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddCustomer}
      />

      <CustomerDetails
        open={!!selectedCustomerId}
        onOpenChange={() => setSelectedCustomerId(null)}
        customer={customers.find(c => c.id === selectedCustomerId)}
        onUpdate={handleUpdateCustomer}
        onDelete={handleDeleteCustomer}
        onAddPayment={handleAddPayment}
      />
    </div>
  )
}
