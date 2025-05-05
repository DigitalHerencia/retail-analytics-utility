"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
// Import Line component from react-chartjs-2 and necessary Chart.js modules
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import type { InventoryItem, Customer, Transaction } from "@/types"
import { formatGrams, formatCurrency } from "@/lib/utils"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RetailAnalyticsChartsProps {
  transactions: Transaction[]
  customers: Customer[]
  inventory: InventoryItem[]
}

export function RetailAnalyticsCharts({
  transactions,
  customers,
  inventory
}: RetailAnalyticsChartsProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month")
  const [chartType, setChartType] = useState<"revenue" | "profit" | "items">("revenue")
  const [showComparison, setShowComparison] = useState(false)

  // Get date range for selected timeframe
  const now = new Date()
  const startDate = new Date(now)
  let prevStartDate: Date
  let prevEndDate: Date
  
  switch (timeframe) {
    case "week":
      startDate.setDate(now.getDate() - 7)
      prevStartDate = new Date(startDate)
      prevStartDate.setDate(prevStartDate.getDate() - 7)
      prevEndDate = new Date(startDate)
      prevEndDate.setDate(prevEndDate.getDate() - 1)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      prevStartDate = new Date(startDate)
      prevStartDate.setMonth(prevStartDate.getMonth() - 1)
      prevEndDate = new Date(startDate)
      prevEndDate.setDate(prevEndDate.getDate() - 1)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      prevStartDate = new Date(startDate)
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1)
      prevEndDate = new Date(startDate)
      prevEndDate.setDate(prevEndDate.getDate() - 1)
      break
  }

  // Filter transactions within date range
  const filteredTransactions = transactions
    .filter(t => t.type === "sale")
    .filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= now;
    })

  // Filter previous period transactions
  const previousPeriodTransactions = showComparison ? transactions
    .filter(t => t.type === "sale")
    .filter(t => {
      const date = new Date(t.date);
      return date >= prevStartDate && date <= prevEndDate;
    }) : []

  // Group transactions by date
  const groupedData = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const key = date.toISOString().split("T")[0];

    if (!acc[key]) {
      acc[key] = {
        revenue: 0,
        profit: 0,
        items: 0,
      };
    }

    acc[key].revenue += transaction.totalPrice;
    acc[key].profit += transaction.profit;
    acc[key].items += transaction.quantityGrams;

    return acc;
  }, {} as Record<string, { revenue: number; profit: number; items: number }>);

  // Group previous period transactions
  const prevGroupedData = previousPeriodTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    // Normalize dates to match current period for comparison
    const daysDiff = Math.floor((date.getTime() - prevStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const normalizedDate = new Date(startDate);
    normalizedDate.setDate(startDate.getDate() + daysDiff);
    const key = normalizedDate.toISOString().split("T")[0];

    if (!acc[key]) {
      acc[key] = {
        revenue: 0,
        profit: 0,
        items: 0,
      };
    }

    acc[key].revenue += transaction.totalPrice;
    acc[key].profit += transaction.profit;
    acc[key].items += transaction.quantityGrams;

    return acc;
  }, {} as Record<string, { revenue: number; profit: number; items: number }>);

  // Fill in missing dates with zeros
  const dates = [];
  const current = new Date(startDate);
  while (current <= now) {
    const key = current.toISOString().split("T")[0];
    if (!groupedData[key]) {
      groupedData[key] = { revenue: 0, profit: 0, items: 0 };
    }
    if (showComparison && !prevGroupedData[key]) {
      prevGroupedData[key] = { revenue: 0, profit: 0, items: 0 };
    }
    dates.push(key);
    current.setDate(current.getDate() + 1);
  }

  // Sort dates and prepare chart data
  const sortedDates = dates.sort();
  
  // Calculate total metrics for current period
  const currentTotal = sortedDates.reduce((total, date) => {
    total.revenue += groupedData[date].revenue;
    total.profit += groupedData[date].profit;
    total.items += groupedData[date].items;
    return total;
  }, { revenue: 0, profit: 0, items: 0 });
  
  // Calculate total metrics for previous period if comparison is enabled
  const prevTotal = showComparison ? sortedDates.reduce((total, date) => {
    total.revenue += prevGroupedData[date]?.revenue || 0;
    total.profit += prevGroupedData[date]?.profit || 0;
    total.items += prevGroupedData[date]?.items || 0;
    return total;
  }, { revenue: 0, profit: 0, items: 0 }) : null;
  
  // Calculate percentage change
  const percentageChange = prevTotal ? {
    revenue: ((currentTotal.revenue - prevTotal.revenue) / prevTotal.revenue) * 100,
    profit: ((currentTotal.profit - prevTotal.profit) / prevTotal.profit) * 100,
    items: ((currentTotal.items - prevTotal.items) / prevTotal.items) * 100
  } : null;

  const chartData: ChartData<'line'> = {
    labels: sortedDates.map(date => {
      const d = new Date(date);
      return timeframe === "week"
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: chartType === "revenue"
          ? "Revenue"
          : chartType === "profit"
            ? "Profit"
            : "Items Sold (g)",
        data: sortedDates.map(date =>
          chartType === "revenue"
            ? groupedData[date].revenue
            : chartType === "profit"
              ? groupedData[date].profit
              : groupedData[date].items
        ),
        borderColor: "rgb(255, 255, 255)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        tension: 0.4,
      },
      ...(showComparison ? [{
        label: `Previous ${timeframe} (${chartType === "revenue" ? "Revenue" : chartType === "profit" ? "Profit" : "Items Sold"})`,
        data: sortedDates.map(date =>
          chartType === "revenue"
            ? prevGroupedData[date]?.revenue || 0
            : chartType === "profit"
              ? prevGroupedData[date]?.profit || 0
              : prevGroupedData[date]?.items || 0
        ),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.4,
        borderDash: [5, 5],
      }] : [])
    ]
  };

  // Define chart options with type ChartOptions<'line'>
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        }
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        }
      }
    },
    plugins: {
      legend: {
        display: showComparison,
        labels: {
          color: "rgba(255, 255, 255, 0.7)"
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return chartType === "items"
              ? `${formatGrams(value)}g`
              : formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <Card className="border-white/20 card-sharp">
      <CardHeader>
        <CardTitle className="gangster-font text-white">ANALYTICS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="gangster-font">TIMEFRAME</Label>
            <Select value={timeframe} onValueChange={(value: "week" | "month" | "year") => setTimeframe(value)}>
              <SelectTrigger className="input-sharp">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="gangster-font">CHART</Label>
            <Select value={chartType} onValueChange={(value: "revenue" | "profit" | "items") => setChartType(value)}>
              <SelectTrigger className="input-sharp">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="items">Items Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="gangster-font">COMPARE WITH PREVIOUS {timeframe.toUpperCase()}</Label>
            <div className="flex items-center space-x-2">
              <Switch id="compare-switch" checked={showComparison} onCheckedChange={setShowComparison} />
              <Label htmlFor="compare-switch" className="cursor-pointer">
                {showComparison ? "Enabled" : "Disabled"}
              </Label>
            </div>
          </div>
        </div>
        
        {showComparison && percentageChange && (
          <div className="p-3 border border-white/20 rounded-lg bg-zinc-900/50">
            <p className="text-sm font-medium">
              Compared to previous {timeframe}:{' '}
              <span className={percentageChange[chartType] >= 0 ? "text-green-500" : "text-red-500"}>
                {percentageChange[chartType] >= 0 ? '↑' : '↓'} {Math.abs(percentageChange[chartType]).toFixed(2)}%
                {' '}{chartType === "revenue" || chartType === "profit" ? "in " : ""}
                {chartType}
              </span>
            </p>
          </div>
        )}

        <div className="h-[300px] w-full">
          <Line
            data={chartData}
            options={chartOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
}
