"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { Customer } from "@/lib/data"

interface CustomerFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customer: Customer) => void
  initialData?: Customer | null
}

interface CustomerFormValues {
  name?: string
  phone?: string
  amountOwed: number
  dueDate?: string
  notes?: string
}

export default function CustomerForm({ isOpen, onClose, onSave, initialData }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CustomerFormValues>({
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      amountOwed: initialData?.amountOwed || 0,
      dueDate: initialData?.dueDate || "",
      notes: initialData?.notes || "",
    },
  })

  const handleSubmit = (values: CustomerFormValues) => {
    setIsLoading(true)

    const customer: Customer = {
      id: initialData?.id || uuidv4(),
      name: values.name || "Anonymous Client",
      phone: values.phone || "",
      email: "", // Keep empty for anonymity
      address: "", // Keep empty for anonymity
      amountOwed: values.amountOwed || 0,
      dueDate: values.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: (values.amountOwed || 0) === 0 ? "paid" : "unpaid",
      paymentHistory: initialData?.paymentHistory || [],
      notes: values.notes || "",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(customer)
    setIsLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-smoke border-white card-sharp max-w-md">
        <DialogHeader>
          <DialogTitle className="gangster-font text-white">
            {initialData ? "EDIT CLIENT" : "ADD NEW CLIENT"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the client's information with privacy in mind."
              : "Enter minimal client information. All fields are optional for anonymity."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">NAME (OPTIONAL)</FormLabel>
                  <FormControl>
                    <Input {...field} className="input-sharp" placeholder="Anonymous" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">PHONE (OPTIONAL)</FormLabel>
                  <FormControl>
                    <Input {...field} className="input-sharp" placeholder="Optional contact number" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amountOwed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">AMOUNT OWED</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        className="input-sharp" 
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">DUE DATE (OPTIONAL)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="input-sharp" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">NOTES (OPTIONAL)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="input-sharp resize-none"
                      placeholder="Additional notes (private)"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="bg-white hover:bg-white/90 text-black button-sharp">
                {isLoading ? "SAVING..." : initialData ? "UPDATE CLIENT" : "ADD CLIENT"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
