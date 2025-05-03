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
import type { InventoryItem } from "@/types"
import {
  formatCurrency,
  formatGrams,
  formatOunces,
} from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { addInventoryItem, editInventoryItem, removeInventoryItem } from "@/lib/actions/inventoryActions"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.enum(["g", "oz", "kg"]),
  costPerOz: z.coerce.number().positive("Cost must be positive"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  reorderThresholdG: z.coerce.number().nonnegative("Threshold must be non-negative"),
})

interface InventoryTableProps {
  inventory: InventoryItem[]
  tenantId: string
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="bg-white hover:bg-white/90 text-black button-sharp border-white" disabled={pending}>
      {pending ? (label === "ADD PRODUCT" ? "Adding..." : "Updating...") : label}
    </Button>
  )
}

export default function InventoryTable({ inventory, tenantId }: InventoryTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const { toast } = useToast()
  const router = useRouter()

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

  const [addState, addAction] = useActionState<
    { success?: boolean; error?: string },
    FormData
  >(
    async (state, formData) => {
      try {
        await addInventoryItem(tenantId, formData)
        form.reset()
        setIsAddDialogOpen(false)
        return { success: true }
      } catch {
        return { error: "Failed to add inventory item" }
      }
    },
    { success: false }
  )

  const [editState, editAction] = useActionState<
    { success?: boolean; error?: string },
    FormData
  >(
    async (_state, formData) => {
      try {
        if (!editingItem) return { error: "No item selected" }
        await editInventoryItem(tenantId, editingItem.id, formData)
        form.reset()
        setIsEditDialogOpen(false)
        setEditingItem(null)
        return { success: true }
      } catch {
        return { error: "Failed to update inventory item" }
      }
    },
    { success: false }
  )

  const [deleteState, deleteAction] = useActionState<
    { success?: boolean; error?: string },
    string
  >(
    async (_state, id) => {
      try {
        await removeInventoryItem(tenantId, id)
        return { success: true }
      } catch {
        return { error: "Failed to delete inventory item" }
      }
    },
    { success: false }
  )

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item)

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
                          <Button variant="outline" size="sm" onClick={() => deleteAction(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {deleteState?.error && <div className="text-red-500 text-sm mt-2">{deleteState.error}</div>}
                        {deleteState?.success && <div className="text-green-500 text-sm mt-2">Product deleted successfully.</div>}
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
            <form action={addAction} className="space-y-4">
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
                <SubmitButton label="ADD PRODUCT" />
              </DialogFooter>
              {addState?.error && <div className="text-red-500 text-sm mt-2">{addState.error}</div>}
              {addState?.success && <div className="text-green-500 text-sm mt-2">Product added successfully.</div>}
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
            <form action={editAction} className="space-y-4">
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
                <SubmitButton label="UPDATE PRODUCT" />
              </DialogFooter>
              {editState?.error && <div className="text-red-500 text-sm mt-2">{editState.error}</div>}
              {editState?.success && <div className="text-green-500 text-sm mt-2">Product updated successfully.</div>}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
