"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import components that need client-side features
const CashRegister = dynamic(() => import("@/components/cash-register"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  )
})

// Main component
export default function Home() {
  const [isClient, setIsClient] = useState(false)
  
  // This effect runs only on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only render the content on the client side
  if (!isClient) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="w-full max-w-5xl mx-auto p-4">
          <Skeleton className="w-full h-[600px]" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full max-w-5xl mx-auto p-4">
        <CashRegister />
      </div>
    </main>
  )
}
