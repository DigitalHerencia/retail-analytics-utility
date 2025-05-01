"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { InventoryItem } from "@/lib/data"
import {
  formatCurrency,
  formatGrams,
  formatOunces,
  formatKilograms,
  ouncesToGrams,
  gramsToOunces,
  gramsToKilograms,
} from "@/lib/utils"

interface InventoryTableProps {
  inventory: InventoryItem[]
  onAddItem: (item: InventoryItem) => void
  onUpdateItem: (item: InventoryItem) => void
  onDeleteItem: (id: string) => void
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.enum(["g", "oz", "kg"]),
  costPerOz: z.coerce.number().positive("Cost must be positive"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  reorderThresholdG: z.coerce.number().nonnegative("Threshold must be non-negative"),
})

export default function InventoryTable({ inventory, onAddItem, onUpdateItem, onDeleteItem }: InventoryTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      unit: "oz",
      costPerOz: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      reorderThresholdG: 100,
    },
  })

  const handleAddItem = (values: z.infer<typeof formSchema>) => {
    // Convert quantity to grams based on selected unit
    let quantityG: number

    if (values.unit === "oz") {
      quantityG = ouncesToGrams(values.quantity)
    } else if (values.unit === "kg") {
      quantityG = values.quantity * 1000
    } else {
      quantityG = values.quantity
    }

    const quantityOz = gramsToOunces(quantityG)
    const quantityKg = gramsToKilograms(quantityG)
    const costPerOz = values.costPerOz
    const totalCost = costPerOz * quantityOz

    const newItem: InventoryItem = {
      id: uuidv4(),
      name: values.name,
      description: values.description || "",
      quantityG,
      quantityOz,
      quantityKg,
      purchaseDate: values.purchaseDate,
      costPerOz,
      totalCost,
      reorderThresholdG: values.reorderThresholdG,
    }

    onAddItem(newItem)
    setIsAddDialogOpen(false)
    form.reset()
  }

  const handleEditItem = (values: z.infer<typeof formSchema>) => {
    if (!editingItem) return

    // Convert quantity to grams based on selected unit
    let quantityG: number

    if (values.unit === "oz") {
      quantityG = ouncesToGrams(values.quantity)
    } else if (values.unit === "kg") {
      quantityG = values.quantity * 1000
    } else {
      quantityG = values.quantity
    }

    const quantityOz = gramsToOunces(quantityG)
    const quantityKg = gramsToKilograms(quantityG)
    const costPerOz = values.costPerOz
    const totalCost = costPerOz * quantityOz

    const updatedItem: InventoryItem = {
      ...editingItem,
      name: values.name,
      description: values.description || "",
      quantityG,
      quantityOz,
      quantityKg,
      purchaseDate: values.purchaseDate,
      costPerOz,
      totalCost,
      reorderThresholdG: values.reorderThresholdG,
    }

    onUpdateItem(updatedItem)
    setIsEditDialogOpen(false)
    setEditingItem(null)
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)

    // Default to showing quantity in ounces since that's how it's purchased
    form.reset({
      name: item.name,
      description: item.description,
      quantity: item.quantityOz,
      unit: "oz",
      costPerOz: item.costPerOz,
      purchaseDate: item.purchaseDate,
      reorderThresholdG: item.reorderThresholdG,
    })

    setIsEditDialogOpen(true)
  }

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalCost, 0)
  const totalQuantityG = inventory.reduce((sum, item) => sum + item.quantityG, 0)
  const totalQuantityOz = inventory.reduce((sum, item) => sum + item.quantityOz, 0)
  const totalQuantityKg = inventory.reduce((sum, item) => sum + item.quantityKg, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white hover:bg-white/90 text-black button-sharp">
                  <Plus className="mr-2 h-4 w-4" /> Add Inventory
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Grade/Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Quantity</TableHead>
                  <TableHead className="hidden sm:table-cell">Cost</TableHead>
                  <TableHead className="hidden sm:table-cell">Purchase Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory?.length === 0 ? (
                  <TableRow>
                    {/* Adjust colSpan: 2 columns visible below sm, 7 columns visible sm and up */}
                    <TableCell colSpan={2} className="text-center sm:colSpan-7">
                      No inventory found. Add inventory to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.description}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div>{formatGrams(item.quantityG)}</div>
                          <div className="text-xs white hidden sm:block">{formatOunces(item.quantityOz)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatCurrency(item.totalCost)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.purchaseDate}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {item.quantityG <= item.reorderThresholdG ? (
                          <Badge variant="destructive" className="whitespace-nowrap">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="whitespace-nowrap">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onDeleteItem(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
            <DialogDescription>Update the details of this inventory item.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade/Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Premium, Standard, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Optional description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="g">Grams (g)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="kg">Kilograms (kg)</option>
                      </select>
                      <FormDescription>Select the unit of measurement</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="costPerOz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Ounce</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>Wholesale cost per ounce</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reorderThresholdG"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Threshold (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} />
                    </FormControl>
                    <FormDescription>When to reorder (in grams)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Inventory</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
