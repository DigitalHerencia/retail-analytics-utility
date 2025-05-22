"use client"

import { useState, useEffect } from "react"
import InventoryManagement from "@/components/inventory-management"
import { getInventory } from "@/app/actions"
<<<<<<< HEAD
import type { InventoryItem } from "@/db/data"
=======
import type { InventoryItem } from "@/lib/data"
>>>>>>> 6de2fd9eac2b05bd38ac61c9d2fe09041f0df49a

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true)
      try {
        const data = await getInventory()
        console.log("Inventory loaded:", data)
        setInventory(data)
      } catch (err) {
        console.error("Error loading inventory:", err)
        setError("Failed to load inventory data. Please check database connection.")
      } finally {
        setIsLoading(false)
      }
    }

    loadInventory()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-2 rounded text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <InventoryManagement inventory={inventory} />
    </div>
  )
}
