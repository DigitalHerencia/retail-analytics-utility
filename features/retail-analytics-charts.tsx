"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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

  // Get date range for selected timeframe
  const now = new Date()
  const startDate = new Date(now)
  switch (timeframe) {
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  // Filter transactions within date range
  const filteredTransactions = transactions
    .filter(t => t.type === "sale")
    .filter(t => new Date(t.date) >= startDate)

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

  // Fill in missing dates with zeros
  const dates = [];
  const current = new Date(startDate);
  while (current <= now) {
    const key = current.toISOString().split("T")[0];
    if (!groupedData[key]) {
      groupedData[key] = { revenue: 0, profit: 0, items: 0 };
    }
    dates.push(key);
    current.setDate(current.getDate() + 1);
  }

  // Sort dates and prepare chart data
  const sortedDates = dates.sort();
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
      }
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
        display: false
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

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
