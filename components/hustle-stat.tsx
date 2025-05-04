import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface HustleStatProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}

export function HustleStat({ title, value, icon, trend, trendValue, className }: HustleStatProps) {
  return (
    <Card className={cn("overflow-hidden card-sharp border-white bg-black/50", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/70 gangster-font">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-white money-text text-shadow">{value}</h3>
            {trend && trendValue && (
              <p
                className={cn(
                  "text-xs mt-1 font-medium",
                  trend === "up" && "text-money",
                  trend === "down" && "text-danger",
                  trend === "neutral" && "text-white/60",
                )}
              >
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {trendValue}
              </p>
            )}
          </div>
          <div className="bg-white/5 border border-white/20 p-2.5 rounded-sm">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
