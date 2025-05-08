"use client"

import { useState, useEffect } from "react"
import CashRegister from "@/components/cash-register"
import { initializeDefaultBusinessData } from "@/app/actions"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showTips, setShowTips] = useState(true)

  // Initialize database with default data if needed
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)

      // Initialize default business data if none exists
      await initializeDefaultBusinessData()

      setIsLoading(false)
    }

    initialize()
  }, [])

  const handleHideTips = () => {
    setShowTips(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <CashRegister showTips={showTips} onHideTips={handleHideTips} />
    </div>
  )
}
