"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type PricePoint } from "@/lib/data"

interface PriceTableProps {
  pricePoints: PricePoint[]
  onSelectPricePoint?: (id: string) => void
  selectedPricePointId?: string
}

export default function PriceTable({
  pricePoints,
  onSelectPricePoint = () => {},
  selectedPricePointId = "",
}: PriceTableProps) {
  return (
    <div className="overflow-x-auto py-4 px-2">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-white">
            <TableHead className="px-6">Markup %</TableHead>
            <TableHead className="px-6">Wholesale<br />(per g)</TableHead>
            <TableHead className="px-6">Retail<br />(per g)</TableHead>
            <TableHead className="px-6">Profit<br />(per g)</TableHead>
            <TableHead className="px-6">Qty/month<br />(g)</TableHead>
            <TableHead className="px-6">Qty/month<br />(oz)</TableHead>
            <TableHead className="px-6">Monthly<br />revenue</TableHead>
            <TableHead className="px-6">Monthly<br />cost</TableHead>
            <TableHead className="px-6">Monthly<br />profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricePoints.map((point) => {
            const isSelected = point.id === selectedPricePointId
            return (
              <TableRow
                key={point.id}
                className={`cursor-pointer border-white ${
                  isSelected ? "bg-primary/20 hover:bg-primary/20" : "hover:bg-accent"
                }`}
                onClick={() => onSelectPricePoint(point.id)}
              >
                <TableCell className="font-medium px-6">{point.markupPercentage}%</TableCell>
                <TableCell className="px-6">${point.wholesalePricePerGram.toFixed(2)}</TableCell>
                <TableCell className="px-6">${point.retailPricePerGram.toFixed(2)}</TableCell>
                <TableCell className="px-6">${point.profitPerGram.toFixed(2)}</TableCell>
                <TableCell className="px-6">{point.breakEvenGramsPerMonth.toFixed(1)}</TableCell>
                <TableCell className="px-6">{point.breakEvenOuncesPerMonth.toFixed(2)}oz</TableCell>
                <TableCell className="px-6">${point.monthlyRevenue.toFixed(2)}</TableCell>
                <TableCell className="px-6">${point.monthlyCost.toFixed(2)}</TableCell>
                <TableCell className="px-6">${point.monthlyProfit.toFixed(2)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
