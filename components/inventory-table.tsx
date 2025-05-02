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
import { useToast } from "@/hooks/use-toast"

interface InventoryTableProps {
  inventory: InventoryItem[]
  onAdd: (item: InventoryItem) => void
  onUpdate: (item: InventoryItem) => void
  onDelete: (id: string) => void
  isLoading?: boolean
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

export default function InventoryTable({ inventory, onAdd, onUpdate, onDelete, isLoading = false }: InventoryTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const { toast } = useToast()

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
    try {
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

      onAdd(newItem)
      
      toast({
        title: "Item added",
        description: `${newItem.name} has been added to inventory`,
      })
      
      setIsAddDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = (values: z.infer<typeof formSchema>) => {
    if (!editingItem) return

    try {
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

      onUpdate(updatedItem)
      
      toast({
        title: "Item updated",
        description: `${updatedItem.name} has been updated`,
      })
      
      setIsEditDialogOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Error updating inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)

    // Determine which unit to display based on the largest non-zero value
    let displayUnit = "oz";
    let displayQuantity = item.quantityOz;

    if (item.quantityKg > 0.01) {
      displayUnit = "kg";
      displayQuantity = item.quantityKg;
    } else if (item.quantityG > 10) {
      displayUnit = "g";
      displayQuantity = item.quantityG;
    }

    form.reset({
      name: item.name,
      description: item.description,
      quantity: displayQuantity,
      unit: displayUnit as "oz" | "g" | "kg",
      costPerOz: item.costPerOz,
      purchaseDate: item.purchaseDate,
      reorderThresholdG: item.reorderThresholdG,
    })

    setIsEditDialogOpen(true)
  }

  const handleDeleteItem = (id: string) => {
    try {
      onDelete(id)
      toast({
        title: "Item deleted",
        description: "Inventory item has been removed",
      })
    } catch (error) {
      console.error("Error deleting inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      })
    }
  }

  const openAddDialog = () => {
    form.reset({
      name: "",
      description: "",
      quantity: 0,
      unit: "oz",
      costPerOz: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      reorderThresholdG: 100,
    })
    setIsAddDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="card-sharp border-white">
          <CardHeader>
            <CardTitle className="gangster-font text-white">INVENTORY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              <p className="mt-4">Loading inventory data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="gangster-font text-white">INVENTORY MANAGEMENT</CardTitle>
            <Button 
              onClick={openAddDialog}
              className="bg-white hover:bg-white/90 text-black button-sharp font-medium"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center p-8">
              <p>No inventory items found. Add your first product to get started.</p>
            </div>
          ) : (
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
                  {inventory.map((item) => (
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
                          <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Inventory Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-smoke border-white card-sharp max-w-3xl">
          <DialogHeader>
            <DialogTitle className="gangster-font text-white text-xl">ADD NEW PRODUCT</DialogTitle>
            <DialogDescription>Enter the details of the new product for your inventory.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">PRODUCT NAME</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Premium, Standard, etc." className="input-sharp" />
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
                    <FormLabel className="gangster-font">DESCRIPTION</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Optional description" className="input-sharp resize-none" />
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
                      <FormLabel className="gangster-font">QUANTITY</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
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
                      <FormLabel className="gangster-font">UNIT</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-sharp"
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
                      <FormLabel className="gangster-font">COST PER OUNCE</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
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
                      <FormLabel className="gangster-font">PURCHASE DATE</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="input-sharp" />
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
                    <FormLabel className="gangster-font">REORDER THRESHOLD (GRAMS)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} className="input-sharp" />
                    </FormControl>
                    <FormDescription>When to reorder (in grams)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="button-sharp"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-white hover:bg-white/90 text-black button-sharp border-white">
                  ADD PRODUCT
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-smoke border-white card-sharp max-w-3xl">
          <DialogHeader>
            <DialogTitle className="gangster-font text-white text-xl">EDIT PRODUCT</DialogTitle>
            <DialogDescription>Update the details of this inventory item.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">PRODUCT NAME</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Premium, Standard, etc." className="input-sharp" />
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
                    <FormLabel className="gangster-font">DESCRIPTION</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Optional description" className="input-sharp resize-none" />
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
                      <FormLabel className="gangster-font">QUANTITY</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
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
                      <FormLabel className="gangster-font">UNIT</FormLabel>
                      <select
                        className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-sharp"
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
                      <FormLabel className="gangster-font">COST PER OUNCE</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} className="input-sharp" />
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
                      <FormLabel className="gangster-font">PURCHASE DATE</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="input-sharp" />
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
                    <FormLabel className="gangster-font">REORDER THRESHOLD (GRAMS)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} className="input-sharp" />
                    </FormControl>
                    <FormDescription>When to reorder (in grams)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="button-sharp"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-white hover:bg-white/90 text-black button-sharp border-white">
                  UPDATE PRODUCT
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
