"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { DollarSign, Users, Package, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { id: "register", href: "/", label: "REGISTER", icon: <DollarSign className="h-5 w-5" /> },
    { id: "inventory", href: "/inventory", label: "INVENTORY", icon: <Package className="h-5 w-5" /> },
    { id: "clients", href: "/customers", label: "CLIENTS", icon: <Users className="h-5 w-5" /> },
    { id: "forecast", href: "/forecast", label: "FORECAST", icon: <BarChart3 className="h-5 w-5" /> },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center transition-colors border-t-2 text-white",
                "text-white",
                "border-white",
                isActive ? "bg-white/10" : "text-white/50 border-transparent hover:text-white/70",
              )}
            >
              <div className={cn("p-1 rounded-full", isActive ? "bg-white/20" : "")}>{item.icon}</div>
              <span className="text-xs mt-1 font-medium gangster-font text-white">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
