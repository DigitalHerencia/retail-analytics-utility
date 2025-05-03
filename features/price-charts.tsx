"use client"

import { useMemo } from "react"
import type { PricePoint } from "@/types"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useMediaQuery } from "@/hooks/use-mobile"
import { formatCurrency } from "@/lib/utils"

interface PriceChartsProps {
  pricePoints: PricePoint[]
}

export default function PriceCharts({ pricePoints }: PriceChartsProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 768px)")

  const chartData = useMemo(() => {
    // For mobile, limit the number of data points
    const filteredPoints =
      isMobile && pricePoints.length > 5
        ? pricePoints.filter((_, i) => i % Math.ceil(pricePoints.length / 5) === 0)
        : pricePoints

    return filteredPoints.map((p) => ({
      name: `${p.markupPercentage}%`,
      retailPrice: p.retailPricePerGram,
      wholesalePrice: p.retailPricePerGram - p.profitPerGram,
      margin: p.profitPerGram,
      quantity: p.breakEvenGramsPerMonth,
      revenue: p.monthlyRevenue,
      cost: p.monthlyCost,
      profit: p.monthlyProfit,
    }))
  }, [pricePoints, isMobile])

  // Highlight the middle data point (median price)
  const middleIndex = Math.floor(pricePoints.length / 2)

  // Custom styles for all charts to ensure consistency with the gangster theme
  const chartStyle = {
    fill: "#FFFFFF",
    fontFamily: "'Roboto Condensed', sans-serif",
    fontSize: isMobile ? 10 : 12
  }
  
  const tooltipStyle = {
    backgroundColor: "#000",
    border: "1px solid #FFFFFF",
    borderRadius: "0px",
    padding: "8px",
    color: "#FFFFFF",
    boxShadow: "none",
  }

  const getMarginByScreenSize = () => {
    if (isMobile) return { top: 5, right: 10, left: 0, bottom: 5 };
    if (isTablet) return { top: 15, right: 20, left: 10, bottom: 5 };
    return { top: 20, right: 30, left: 20, bottom: 5 };
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Price Breakdown Chart */}
      <div className="bg-black p-6 border border-white card-sharp">
        <h3 className="text-lg font-bold mb-4 gangster-font">PRICE BREAKDOWN</h3>
        <div className={`h-${isMobile ? "56" : "72"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={getMarginByScreenSize()}
              layout={isMobile ? "vertical" : "horizontal"}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              {isMobile ? (
                <>
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={40} 
                    tick={{ ...chartStyle }} 
                    axisLine={{ stroke: "#FFFFFF" }}
                  />
                  <XAxis 
                    type="number" 
                    tick={{ ...chartStyle }} 
                    axisLine={{ stroke: "#FFFFFF" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={{ ...chartStyle }} axisLine={{ stroke: "#FFFFFF" }} />
                  <YAxis 
                    tick={{ ...chartStyle }} 
                    axisLine={{ stroke: "#FFFFFF" }} 
                    tickFormatter={(value) => `$${value}`}
                  />
                </>
              )}
              <Tooltip 
                contentStyle={tooltipStyle} 
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              />
              <Legend
                wrapperStyle={{ ...chartStyle, paddingTop: 10 }}
                verticalAlign={isMobile ? "top" : "bottom"}
                iconType="square"
              />
              <Bar
                dataKey="wholesalePrice"
                name="Wholesale Price"
                stackId="a"
                fill="#32D74B"
                barSize={isMobile ? 15 : 30}
              />
              <Bar 
                dataKey="margin" 
                name="Profit Margin" 
                stackId="a" 
                fill="#9C4AFF" 
                barSize={isMobile ? 15 : 30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price vs. Quantity Chart */}
      <div className="bg-black p-6 border border-white card-sharp">
        <h3 className="text-lg font-bold mb-4 gangster-font">PRICE VS. QUANTITY</h3>
        <div className={`h-${isMobile ? "56" : "72"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={getMarginByScreenSize()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                tick={{ ...chartStyle }} 
                axisLine={{ stroke: "#FFFFFF" }}
                interval={isMobile ? 1 : 0} 
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ ...chartStyle }}
                width={isMobile ? 40 : 60}
                axisLine={{ stroke: "#FFFFFF" }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ ...chartStyle }}
                width={isMobile ? 40 : 60}
                axisLine={{ stroke: "#FFFFFF" }}
                tickFormatter={(value) => `${value}g`}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => {
                  if (name === "Retail Price") return [`$${value.toFixed(2)}`, name];
                  return [`${value.toFixed(0)}g`, name];
                }}
              />
              <Legend
                wrapperStyle={{ ...chartStyle, paddingTop: 10 }}
                verticalAlign={isMobile ? "top" : "bottom"}
                iconType="square"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="retailPrice"
                name="Retail Price"
                stroke="#9C4AFF"
                activeDot={{ r: isMobile ? 4 : 8, fill: "#9C4AFF" }}
                strokeWidth={3}
                dot={isMobile ? false : { r: 3, fill: "#9C4AFF" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="quantity"
                name="Monthly Quantity"
                stroke="#32D74B"
                activeDot={{ r: isMobile ? 4 : 8, fill: "#32D74B" }}
                strokeWidth={3}
                dot={isMobile ? false : { r: 3, fill: "#32D74B" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue, Cost & Profit Chart */}
      <div className="bg-black p-6 border border-white card-sharp">
        <h3 className="text-lg font-bold mb-4 gangster-font">REVENUE & PROFIT</h3>
        <div className={`h-${isMobile ? "56" : "72"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={getMarginByScreenSize()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                tick={{ ...chartStyle }} 
                axisLine={{ stroke: "#FFFFFF" }}
                interval={isMobile ? 1 : 0} 
              />
              <YAxis
                tick={{ ...chartStyle }}
                width={isMobile ? 40 : 60}
                axisLine={{ stroke: "#FFFFFF" }}
                tickFormatter={(value) => isMobile ? `$${value/1000}k` : `$${value}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              />
              <Legend
                wrapperStyle={{ ...chartStyle, paddingTop: 10 }}
                verticalAlign={isMobile ? "top" : "bottom"}
                iconType="square"
              />
              <Bar 
                dataKey="revenue" 
                name="Monthly Revenue" 
                fill="#9C4AFF" 
                barSize={isMobile ? 15 : 30} 
              />
              <Bar 
                dataKey="cost" 
                name="Monthly Cost" 
                fill="#32D74B" 
                barSize={isMobile ? 15 : 30} 
              />
              <Bar 
                dataKey="profit" 
                name="Net Profit" 
                fill="#FFFFFF" 
                barSize={isMobile ? 15 : 30} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Margin Percentage Chart */}
      <div className="bg-black p-6 border border-white card-sharp">
        <h3 className="text-lg font-bold mb-4 gangster-font">PROFIT MARGIN PERCENTAGE</h3>
        <div className={`h-${isMobile ? "56" : "72"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={getMarginByScreenSize()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                tick={{ ...chartStyle }} 
                axisLine={{ stroke: "#FFFFFF" }}
                interval={isMobile ? 1 : 0} 
              />
              <YAxis 
                tick={{ ...chartStyle }} 
                width={isMobile ? 40 : 60}
                axisLine={{ stroke: "#FFFFFF" }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Profit Margin"]}
              />
              <Legend
                wrapperStyle={{ ...chartStyle, paddingTop: 10 }}
                verticalAlign={isMobile ? "top" : "bottom"}
                iconType="square"
              />
              <Line
                type="monotone"
                dataKey={(data) => data.margin / data.retailPrice}
                name="Profit Margin %"
                stroke="#FF9F0A"
                activeDot={{ r: isMobile ? 4 : 8, fill: "#FF9F0A" }}
                strokeWidth={3}
                dot={isMobile ? false : { r: 3, fill: "#FF9F0A" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
