"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import type { PricePoint } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface PriceTableProps {
  prices: PricePoint[]
  onEdit: (price: PricePoint) => void
  onDelete: (price: PricePoint) => void
}

export default function PriceTable({ prices, onEdit, onDelete }: PriceTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: string }>({ key: null, direction: 'asc' });
  const [isAddingPrice, setIsAddingPrice] = useState(false);

  function formatPercentage(value: number): string {
    const percentage = (value * 100).toFixed(2);
    return `${percentage}%`;
  }

  return (
    <div className="w-full">
      <Card className="card-sharp border-white bg-black/50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white gangster-font">PRICE LIST</h2>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingPrice(true)}
              className="button-sharp border-white text-white hover:bg-white hover:text-black"
            >
              <Plus className="h-4 w-4" />
              ADD PRICE
            </Button>
          </div>

          <div className="relative overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-white/20">
                  <TableHead className="text-left text-white/70">Item</TableHead>
                  <TableHead className="text-left text-white/70">Price</TableHead>
                  <TableHead className="text-left text-white/70">Cost</TableHead>
                  <TableHead className="text-left text-white/70">Margin</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((price) => (
                  <TableRow 
                    key={price.id} 
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="text-white">{price.id}</TableCell>
                    <TableCell className="text-white money-text">
                      ${formatCurrency(price.retailPricePerGram)}
                    </TableCell>
                    <TableCell className="text-white money-text">
                      ${formatCurrency(price.wholesalePricePerGram)}
                    </TableCell>
                    <TableCell className="text-white money-text">
                      {formatPercentage((price.retailPricePerGram - price.wholesalePricePerGram) / price.wholesalePricePerGram)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(price)}
                        className="text-white hover:text-white hover:bg-white/10 mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(price)}
                        className="text-white hover:text-white hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
