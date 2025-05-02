import Header from "@/components/header"
import { HustleStat } from "@/components/hustle-stat"
import { HustleTip } from "@/components/hustle-tip"
import { DollarSign, TrendingUp, Calculator } from "lucide-react"
import RetailPricingTool from "@/components/retail-pricing-tool"

export default function PricingPage() {
  // Demo stats for now; replace with real data if available
  const stats = [
    {
      title: "PRICING SCENARIOS",
      value: "5+",
      icon: <Calculator className="h-5 w-5 text-white" />,
    },
    {
      title: "MAX PROFIT POTENTIAL",
      value: "$10,000+",
      icon: <TrendingUp className="h-5 w-5 text-white" />,
    },
    {
      title: "AVG. MARKUP",
      value: "100%",
      icon: <DollarSign className="h-5 w-5 text-white" />,
    },
  ]

  return (
    <div className="space-y-6">
      <Header />
      <div className="text-center mb-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <HustleStat key={i} title={stat.title} value={stat.value} icon={stat.icon} className="border-white" />
        ))}
      </div>
      <div className="border-2 border-white rounded-lg p-2">
        <RetailPricingTool />
      </div>
    </div>
  )
}
