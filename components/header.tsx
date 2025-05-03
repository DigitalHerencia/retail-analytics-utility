"use client"

import { useAuth } from "@clerk/nextjs"
import { HeaderClient } from "./header-client"

export function Header() {
  const { userId } = useAuth()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <HeaderClient userId={userId || ''} />
    </header>
  )
}
