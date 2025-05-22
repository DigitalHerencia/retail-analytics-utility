"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Rectangle
} from "recharts"
import { HustleStat } from "@/components/hustle-stat"
import { TrendingUp, DollarSign, ArrowRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePricing } from "@/hooks/use-pricing"
import { HustleTip } from "@/components/hustle-tip"
import type { BusinessData, InventoryItem, Customer, Transaction } from "@/types"

export interface MonthlyForecastProps {
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  transactions: Transaction[]
}

export default function MonthlyForecast({
  businessData,
  inventory,
  customers,
  transactions
}: MonthlyForecastProps) {
  const { scenarios } = usePricing()
  const [forecastMonths, setForecastMonths] = useState(6)
  const [salesGrowth, setSalesGrowth] = useState(10) // 10% monthly growth
  const [customBasePrice, setCustomBasePrice] = useState(0)

  // Price points from pricing context or calculate based on business data
  const availablePricePoints = useMemo(() => {
    if (scenarios && scenarios.length > 0) {
      return scenarios
    }
    
    // Default price points based on wholesale price
    const wholesalePricePerGram = businessData.wholesalePricePerOz / 28.35
    return [
      { retailPriceG: wholesalePricePerGram * 1.5 },
      { retailPriceG: wholesalePricePerGram * 2 },
      { retailPriceG: wholesalePricePerGram * 2.5 }
    ]
  }, [scenarios, businessData])

  const [selectedPricePoint, setSelectedPricePoint] = useState(
    availablePricePoints[0]?.retailPriceG || 0
  )

  // Set initial custom price if available price points exist
  useEffect(() => {
    if (availablePricePoints.length > 0 && availablePricePoints[0].retailPriceG) {
      setCustomBasePrice(availablePricePoints[0].retailPriceG)
      setSelectedPricePoint(availablePricePoints[0].retailPriceG)
    }
  }, [availablePricePoints])

  // Calculate historical sales data from transactions
  const historicalData = useMemo(() => {
    const months: Record<string, { month: string; sales: number; units: number; revenue: number }> = {}
    const now = new Date()
    
    // Initialize last 6 months with zero values
    for (let i = 0; i < 6; i++) {
      const date = subMonths(now, i)
      const monthYear = format(date, "MMM yyyy")
      months[monthYear] = {
        month: monthYear,
        sales: 0,
        units: 0,
        revenue: 0
      }
    }
    
    // Fill in actual sales data from transactions
    transactions.forEach(transaction => {
      if (transaction.type === "sale") {
        const date = new Date(transaction.date)
        const monthYear = format(date, "MMM yyyy")
        
        if (months[monthYear]) {
          months[monthYear].sales += 1
          months[monthYear].units += transaction.quantityGrams
          months[monthYear].revenue += transaction.totalPrice
        }
      }
    })
    
    // Convert to array and sort by date
    return Object.values(months).reverse()
  }, [transactions])

  // Calculate average monthly sales metrics
  const averageMetrics = useMemo(() => {
    if (historicalData.length === 0) return { sales: 0, units: 0, revenue: 0 }
    
    const totalSales = historicalData.reduce((sum, month: { sales: number }) => sum + month.sales, 0)
    const totalUnits = historicalData.reduce((sum, month: { units: number }) => sum + month.units, 0)
    const totalRevenue = historicalData.reduce((sum, month: { revenue: number }) => sum + month.revenue, 0)
    
    return {
      sales: totalSales / historicalData.length,
      units: totalUnits / historicalData.length,
      revenue: totalRevenue / historicalData.length
    }
  }, [historicalData])

  // Calculate forecasted data based on historical data, growth rate, and price point
  const forecastData = useMemo(() => {
    const forecast = []
    const now = new Date()
    
    let lastMonthUnits = Math.max(1, averageMetrics.units) // Start with average or at least 1
    let lastMonthSales = Math.max(1, averageMetrics.sales) // Start with average or at least 1
    
    for (let i = 0; i < forecastMonths; i++) {
      const date = new Date(now)
      date.setMonth(now.getMonth() + i)
      const monthYear = format(date, "MMM yyyy")
      
      // Apply growth rate
      const growthFactor = 1 + (salesGrowth / 100)
      const projectedUnits = lastMonthUnits * growthFactor
      const projectedSales = lastMonthSales * growthFactor
      const projectedRevenue = projectedUnits * selectedPricePoint
      
      forecast.push({
        month: monthYear,
        units: Math.round(projectedUnits),
        sales: Math.round(projectedSales),
        revenue: Math.round(projectedRevenue)
      })
      
      lastMonthUnits = projectedUnits
      lastMonthSales = projectedSales
    }
    
    return forecast
  }, [forecastMonths, salesGrowth, selectedPricePoint, averageMetrics])

  // Calculate profitability metrics based on selected price point
  const profitabilityMetrics = useMemo(() => {
    const wholesalePricePerGram = businessData.wholesalePricePerOz / 28.35
    const grossMarginPerGram = selectedPricePoint - wholesalePricePerGram
    const grossMarginPercentage = (grossMarginPerGram / selectedPricePoint) * 100
    // Calculate projected total units in forecast period
    const totalUnits = forecastData.reduce((sum, month) => sum + month.units, 0)
    const totalRevenue = forecastData.reduce((sum, month) => sum + month.revenue, 0)
    const totalCost = totalUnits * wholesalePricePerGram
    const totalGrossProfit = totalRevenue - totalCost
    // Calculate monthly operating expenses impact
    const monthlyExpenses = businessData.operatingExpenses * forecastMonths
    const netProfit = totalGrossProfit - monthlyExpenses
    return {
      grossMarginPercentage,
      grossMarginPerGram,
      totalRevenue,
      totalCost,
      totalGrossProfit,
      netProfit,
      breakEven: grossMarginPerGram !== 0 ? monthlyExpenses / grossMarginPerGram : 0
    }
  }, [selectedPricePoint, businessData, forecastData, forecastMonths])

  return (
    <div className="container py-4 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2 card-sharp fade-in">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">FORECAST</h1>
          <p className="text-white/80 mt-1">Forecast your sales, revenue, and profits</p>
        </div>
        <HustleTip title="FORECASTING">
          <p>
            Use historical data to predict future sales and revenue. Adjust growth rates and price points to see how they impact your bottom line.
            Make informed decisions about pricing, inventory, and customer management.
          </p>
        </HustleTip>
      </div>
        
        {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="GROSS MARGIN"
          value={`${profitabilityMetrics.grossMarginPercentage.toFixed(2)}%`}
          icon={<DollarSign className="h-5 w-5 text-white" />}
        />
        <HustleStat
          title="NET PROFIT"
          value={`$${profitabilityMetrics.netProfit.toFixed(2)}`}
          icon={<ArrowRight className="h-5 w-5 text-white" />}
        />
        <HustleStat
          title="BREAK EVEN (g)"
          value={`${profitabilityMetrics.breakEven.toFixed(2)}g`}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Forecast Settings</CardTitle>
          <CardDescription>Adjust your forecast parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="forecastMonths">Forecast Duration (months)</Label>
              <Input
                id="forecastMonths"
                type="number"
                value={forecastMonths}
                onChange={(e) => setForecastMonths(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="salesGrowth">Sales Growth Rate (%)</Label>
              <Input
                id="salesGrowth"
                type="number"
                value={salesGrowth}
                onChange={(e) => setSalesGrowth(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="pricePoint">Price Point ($/g)</Label>
              <Select
                value={selectedPricePoint.toString()}
                onValueChange={(value) => setSelectedPricePoint(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select price point" />
                </SelectTrigger>
                <SelectContent>
                  {availablePricePoints.map((point: { retailPriceG: number }, index: number) => (
                    <SelectItem key={index} value={point.retailPriceG.toString()}>{`$${point.retailPriceG.toFixed(2)} / g`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {availablePricePoints.length > 0 && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="customBasePrice">Custom Base Price ($/g)</Label>
                <Input
                  id="customBasePrice"
                  type="number"
                  value={customBasePrice}
                  onChange={(e) => setCustomBasePrice(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Historical Sales Data</CardTitle>
            <CardDescription>Last 6 months of sales data</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Forecasted Sales Data</CardTitle>
            <CardDescription>Projected sales for the next {forecastMonths} months</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" scale="point" padding={{ left: 10, right: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" background={{ fill: "#eee" }} shape={<Rectangle radius={[8, 8, 0, 0]} />} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Projected Revenue</CardTitle>
            <CardDescription>Projected revenue for the next {forecastMonths} months</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Projected Units Sold</CardTitle>
            <CardDescription>Projected units sold for the next {forecastMonths} months</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="units" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}