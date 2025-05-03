"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addPayment } from "@/lib/actions/addPayments"

const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  method: z.string().min(1, "Payment method is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
})

interface PaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="bg-white hover:bg-white/90 text-black button-sharp border-white"
      disabled={pending}
    >
      {pending ? "Adding..." : "Add Payment"}
    </Button>
  )
}

export default function PaymentForm({ open, onOpenChange, customerId }: PaymentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      method: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  // Define the type for the action state
  type ActionState = {
    success?: boolean
    error?: string
  }

  // Server action state
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
      try {
        await addPayment(customerId, formData)
        form.reset()
        onOpenChange(false)
        return { success: true }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to add payment"
        return { error: errorMessage }
      }
    },
    { success: undefined, error: undefined }, // Provide initial state matching the type
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-smoke border-white card-sharp max-w-3xl">
        <DialogHeader>
          <DialogTitle className="gangster-font text-white text-xl">ADD PAYMENT</DialogTitle>
          <DialogDescription>Record a new payment for this customer.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">AMOUNT</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        placeholder="Enter payment amount"
                        className="input-sharp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">PAYMENT METHOD</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Cash, Card, etc." className="input-sharp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">PAYMENT DATE</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="input-sharp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gangster-font">NOTES</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional notes" className="input-sharp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="button-sharp"
              >
                Cancel
              </Button>
              <SubmitButton />
            </div>
            {state?.error && (
              <div className="text-red-500 text-sm mt-2">{state.error}</div>
            )}
            {state?.success && (
              <div className="text-green-500 text-sm mt-2">Payment added successfully.</div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
