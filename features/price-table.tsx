"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatGrams, formatOunces } from "@/lib/utils"
import type { PricePoint } from "@/types"

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
  // Find the recommended price point (middle one)
  const recommendedIndex = Math.floor(pricePoints.length / 2)
  
  return (
    <div className="overflow-x-auto py-2">
      <Table className="w-full border-collapse">
        <TableHeader>
          <TableRow className="border-white border-b-2 hover:bg-transparent">
            <TableHead className="px-4 py-3 gangster-font">MARKUP %</TableHead>
            <TableHead className="px-4 py-3 gangster-font">WHOLESALE<br />(PER G)</TableHead>
            <TableHead className="px-4 py-3 gangster-font">RETAIL<br />(PER G)</TableHead>
            <TableHead className="px-4 py-3 gangster-font">PROFIT<br />(PER G)</TableHead>
            <TableHead className="px-4 py-3 gangster-font">QTY/MONTH<br />(G)</TableHead>
            <TableHead className="px-4 py-3 gangster-font">QTY/MONTH<br />(OZ)</TableHead>
            <TableHead className="px-4 py-3 gangster-font">MONTHLY<br />REVENUE</TableHead>
            <TableHead className="px-4 py-3 gangster-font">MONTHLY<br />COST</TableHead>
            <TableHead className="px-4 py-3 gangster-font">MONTHLY<br />PROFIT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricePoints.map((point, index) => {
            const isSelected = point.id === selectedPricePointId
            const isRecommended = index === recommendedIndex
            
            return (
              <TableRow
                key={point.id}
                className={`cursor-pointer border-white border-b ${
                  isSelected 
                    ? "bg-white/20 hover:bg-white/20" 
                    : isRecommended 
                      ? "bg-white/5 hover:bg-white/15" 
                      : "hover:bg-white/5"
                }`}
                onClick={() => onSelectPricePoint(point.id)}
              >
                <TableCell className="font-medium px-4 py-3">
                  {point.markupPercentage}%
                  {isRecommended && (
                    <Badge className="ml-2 bg-white text-black border-none">RECOMMENDED</Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">{formatCurrency(point.wholesalePricePerGram)}</TableCell>
                <TableCell className="px-4 py-3 font-medium">{formatCurrency(point.retailPricePerGram)}</TableCell>
                <TableCell className="px-4 py-3">{formatCurrency(point.profitPerGram)}</TableCell>
                <TableCell className="px-4 py-3">{formatGrams(point.breakEvenGramsPerMonth)}</TableCell>
                <TableCell className="px-4 py-3">{formatOunces(point.breakEvenOuncesPerMonth)}</TableCell>
                <TableCell className="px-4 py-3">{formatCurrency(point.monthlyRevenue)}</TableCell>
                <TableCell className="px-4 py-3">{formatCurrency(point.monthlyCost)}</TableCell>
                <TableCell className="px-4 py-3 font-medium">{formatCurrency(point.monthlyProfit)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
