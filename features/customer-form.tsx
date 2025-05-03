"use client"

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/types";
import { useForm } from "react-hook-form";

interface CustomerFormValues {
  name?: string;
  phone?: string;
  amountOwed: number;
  dueDate?: string;
  notes?: string;
}

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Customer | null;
  onSave: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}
// ...existing code...

function SubmitButton({ initialData }: { initialData?: Customer | null }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-white hover:bg-white/90 text-black button-sharp">
      {pending ? "SAVING..." : initialData ? "UPDATE CLIENT" : "ADD CLIENT"}
    </Button>
  );
}

export default function CustomerForm({ isOpen, onClose, initialData }: CustomerFormProps) {
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await saveCustomer(formData);
    if (result.success) onClose();
    return result;
  }, { success: false });

  const form = useForm<CustomerFormValues>({
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      amountOwed: initialData?.amountOwed || 0,
      dueDate: initialData?.dueDate || "",
      notes: initialData?.notes || "",
    },
  });

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
          <form action={formAction} className="space-y-4">
            {initialData && <input type="hidden" name="id" value={initialData.id} />}
            {initialData && <input type="hidden" name="createdAt" value={initialData.createdAt} />}
            {initialData && <input type="hidden" name="paymentHistory" value={JSON.stringify(initialData.paymentHistory)} />}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="gangster-font">NAME (OPTIONAL)</FormLabel>
                  <FormControl>
                    <Input {...field} name="name" className="input-sharp" placeholder="Anonymous" />
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
                    <Input {...field} name="phone" className="input-sharp" placeholder="Optional contact number" />
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
                        name="amountOwed"
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-sharp"
                        placeholder="0.00"
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                      <Input {...field} name="dueDate" type="date" className="input-sharp" />
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
                      name="notes"
                      className="input-sharp resize-none"
                      placeholder="Additional notes (private)"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <SubmitButton initialData={initialData} />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
