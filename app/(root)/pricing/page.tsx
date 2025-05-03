import { HustleStat } from "@/components/hustle-stat"
import { HustleTip } from "@/components/hustle-tip"
import { DollarSign, TrendingUp, Calculator } from "lucide-react"
import SimplifiedPricing from "@/features/simplified-pricing"
import { PricingProvider } from "@/hooks/use-pricing"
import { getBusinessData } from "@/lib/fetchers/business"
import { auth } from "@clerk/nextjs/server"

export default async function PricingPage() {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  const { businessData } = await getBusinessData(userId)

  // Compute real stats from businessData
  const avgMarkup = businessData?.wholesalePricePerOz && businessData?.targetProfitPerMonth
    ? Math.round((businessData.targetProfitPerMonth / businessData.wholesalePricePerOz) * 100)
    : 0
  const maxProfit = businessData?.targetProfitPerMonth || 0
  // Pricing scenarios count is not directly available, so show N/A or 0

  const stats = [
    {
      title: "PRICING SCENARIOS",
      value: "N/A",
      icon: <Calculator className="h-5 w-5 text-white" />,
    },
    {
      title: "MAX PROFIT POTENTIAL",
      value: `$${maxProfit.toLocaleString()}`,
      icon: <TrendingUp className="h-5 w-5 text-white" />,
    },
    {
      title: "AVG. MARKUP",
      value: `${avgMarkup}%`,
      icon: <DollarSign className="h-5 w-5 text-white" />,
    },
  ]

  return (
    <div className="container p4 space-y-6">
      <div className="text-center mt-6 mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">PRICING TOOLS</h1>
          <p className="text-white/80 mt-1">Calculate retail prices, analyze profit, and optimize your markup strategy</p>
        </div>
        <HustleTip title="RETAIL PRICING TOOL">
          <p>
            Enter your wholesale cost and target profit. The tool will show you different markup levels and how they affect your profit, break-even, and ROI. Choose the price that works best for your business.
          </p>
        </HustleTip>
      </div>
      <div>
        <PricingProvider>
          <SimplifiedPricing />
        </PricingProvider>
      </div>
    </div>
  )
}