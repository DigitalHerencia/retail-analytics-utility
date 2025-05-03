"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Customer, Payment } from "@/types"
import {
  createCustomer,
  updateCustomer as updateCustomerAction,
  deleteCustomer as deleteCustomerAction,
  addCustomerPayment as addPayment
} from "@/lib/fetchers"
import { toast } from "sonner"

export function useCustomers(tenantId: string, initialCustomers: Customer[] = []) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const addCustomer = async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Create optimistic customer with temporary ID
      const optimisticCustomer = {
        ...customer,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Optimistic update
      setCustomers(prev => [...prev, optimisticCustomer])

      startTransition(async () => {
        // Create via server action
        await createCustomer(tenantId, customer)
        router.refresh()
        toast.success("Customer added successfully")
      })
    } catch (error) {
      console.error("Error adding customer:", error)
      // Revert optimistic update
      setCustomers(customers)
      toast.error("Failed to add customer")
      throw error
    }
  }

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      // Optimistic update
      const newCustomers = customers.map(customer =>
        customer.id === updatedCustomer.id ? {
          ...updatedCustomer,
          updatedAt: new Date().toISOString()
        } : customer
      )
      setCustomers(newCustomers)

      startTransition(async () => {
        // Update via server action
        await updateCustomerAction(tenantId, updatedCustomer)
        router.refresh()
        toast.success("Customer updated successfully")
      })
    } catch (error) {
      console.error("Error updating customer:", error)
      // Revert optimistic update
      setCustomers(customers)
      toast.error("Failed to update customer")
      throw error
    }
  }

  const deleteCustomer = async (customerId: string) => {
    try {
      // Optimistic update
      const newCustomers = customers.filter(customer => customer.id !== customerId)
      setCustomers(newCustomers)

      startTransition(async () => {
        // Delete via server action
        await deleteCustomerAction(tenantId, customerId)
        router.refresh()
        toast.success("Customer deleted successfully")
      })
    } catch (error) {
      console.error("Error deleting customer:", error)
      // Revert optimistic update
      setCustomers(customers)
      toast.error("Failed to delete customer")
      throw error
    }
  }

  const addCustomerPayment = async (customerId: string, payment: Payment) => {
    try {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) throw new Error("Customer not found")

      // Calculate new amount owed and status after payment
      const totalPaid = [...customer.paymentHistory, payment]
        .reduce((sum, p) => sum + p.amount, 0)
      const newAmountOwed = Math.max(0, customer.amountOwed - payment.amount)
      const newStatus: "paid" | "partial" = newAmountOwed === 0 ? "paid" : "partial"

      // Create optimistic update
      const updatedCustomer: Customer = {
        ...customer,
        amountOwed: newAmountOwed,
        status: newStatus,
        paymentHistory: [...customer.paymentHistory, payment],
        updatedAt: new Date().toISOString()
      }

      // Optimistic update
      const newCustomers = customers.map(c =>
        c.id === customerId ? updatedCustomer : c
      )
      setCustomers(newCustomers)

      startTransition(async () => {
        // Add payment via server action
        await addPayment(tenantId, customerId, payment)
        router.refresh()
        toast.success("Payment added successfully")
      })
    } catch (error) {
      console.error("Error adding payment:", error)
      // Revert optimistic update
      setCustomers(customers)
      toast.error("Failed to add payment")
      throw error
    }
  }

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCustomerPayment,
    setCustomers,
    isPending
  }
}
