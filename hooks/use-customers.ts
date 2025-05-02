import { useState, useEffect } from "react"
import type { Customer } from "@/lib/data"

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const fetchCustomers = async () => {
      const tenant_id = localStorage.getItem("tenant_id")
      if (!tenant_id) return setCustomers([])
      const res = await fetch(`/api/customers?tenant_id=${tenant_id}`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      } else {
        setCustomers([])
      }
    }
    fetchCustomers()
  }, [])

  const addCustomer = async (customer: Customer) => {
    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) return
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...customer, tenant_id })
    })
    const res = await fetch(`/api/customers?tenant_id=${tenant_id}`)
    if (res.ok) {
      const data = await res.json()
      setCustomers(data.customers || [])
    }
  }

  const updateCustomer = async (updatedCustomer: Customer) => {
    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) return
    await fetch("/api/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updatedCustomer, tenant_id })
    })
    const res = await fetch(`/api/customers?tenant_id=${tenant_id}`)
    if (res.ok) {
      const data = await res.json()
      setCustomers(data.customers || [])
    }
  }

  const deleteCustomer = async (id: string) => {
    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) return
    await fetch(`/api/customers?tenant_id=${tenant_id}&id=${id}`, { method: "DELETE" })
    const res = await fetch(`/api/customers?tenant_id=${tenant_id}`)
    if (res.ok) {
      const data = await res.json()
      setCustomers(data.customers || [])
    }
  }

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setCustomers
  }
}
