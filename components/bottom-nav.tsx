"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Users,
  Package,
  Settings,
  HelpCircle,
} from "lucide-react"
import type { BusinessData } from "@/types"

interface BottomNavProps {
  // Make businessData optional to avoid strict type checking issues
  businessData?: BusinessData
}

export function BottomNav({ businessData = { wholesalePricePerOz: 0, targetProfitPerMonth: 0, operatingExpenses: 0, targetProfit: undefined } }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/20 p-2">
      <div className="container flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-2">
          <Link href="/customers">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                pathname === "/customers" && "text-white bg-white/10"
              )}
            >
              <Users className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/inventory">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                pathname === "/inventory" && "text-white bg-white/10"
              )}
            >
              <Package className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                pathname === "/" && "text-white bg-white/10"
              )}
            >
              <BarChart className="h-5 w-5" />
            </Button>
          </Link>
          {businessData && (
            <div className="text-sm">
              <div className="text-white font-medium">
                Target: ${businessData.targetProfitPerMonth.toFixed(2)}/mo
              </div>
              <div className="text-white/70 text-xs">
                ${businessData.wholesalePricePerOz.toFixed(2)}/oz wholesale
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                pathname === "/settings" && "text-white bg-white/10"
              )}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/help">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                pathname === "/help" && "text-white bg-white/10"
              )}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
