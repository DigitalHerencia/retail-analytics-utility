"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, DollarSign } from "lucide-react"
import type { Customer, Payment } from "@/types"
import PaymentForm from "@/features/payment-form"

interface CustomerDetailsProps {
  customer?: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (customer: Customer) => void
  onDelete: (id: string) => void
  onAddPayment: (customerId: string, payment: Payment) => void
}

export default function CustomerDetails({
  customer,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onAddPayment,
}: CustomerDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<Customer | undefined>(customer)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Reset state when customer changes
  if (customer?.id !== editedCustomer?.id) {
    setEditedCustomer(customer)
    setIsEditing(false)
  }

  if (!customer) return null

  function handleUpdateCustomer() {
    if (!editedCustomer) return
    onUpdate(editedCustomer)
    setIsEditing(false)
  }

  function handleAddPayment(payment: Payment) {
    if (!customer) return
    onAddPayment(customer.id, payment)
    setShowPaymentForm(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-smoke border-white card-sharp max-w-3xl">
          <DialogHeader>
            <DialogTitle className="gangster-font text-white text-xl">
              {isEditing ? "EDIT CUSTOMER" : "CUSTOMER DETAILS"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update customer information below."
                : "View and manage customer information."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="w-full">Details</TabsTrigger>
              <TabsTrigger value="payments" className="w-full">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="gangster-font">NAME</Label>
                    {isEditing ? (
                      <Input
                        value={editedCustomer?.name}
                        onChange={(e) =>
                          setEditedCustomer((prev) =>
                            prev ? { ...prev, name: e.target.value } : prev
                          )
                        }
                        className="input-sharp"
                      />
                    ) : (
                      <p className="text-white/70">{customer.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">EMAIL</Label>
                    {isEditing ? (
                      <Input
                        value={editedCustomer?.email}
                        onChange={(e) =>
                          setEditedCustomer((prev) =>
                            prev ? { ...prev, email: e.target.value } : prev
                          )
                        }
                        className="input-sharp"
                      />
                    ) : (
                      <p className="text-white/70">{customer.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="gangster-font">PHONE</Label>
                    {isEditing ? (
                      <Input
                        value={editedCustomer?.phone}
                        onChange={(e) =>
                          setEditedCustomer((prev) =>
                            prev ? { ...prev, phone: e.target.value } : prev
                          )
                        }
                        className="input-sharp"
                      />
                    ) : (
                      <p className="text-white/70">{customer.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">ADDRESS</Label>
                    {isEditing ? (
                      <Input
                        value={editedCustomer?.address}
                        onChange={(e) =>
                          setEditedCustomer((prev) =>
                            prev ? { ...prev, address: e.target.value } : prev
                          )
                        }
                        className="input-sharp"
                      />
                    ) : (
                      <p className="text-white/70">{customer.address || "No address provided"}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="gangster-font">AMOUNT OWED</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedCustomer?.amountOwed}
                        onChange={(e) =>
                          setEditedCustomer((prev) =>
                            prev ? { ...prev, amountOwed: parseFloat(e.target.value) } : prev
                          )
                        }
                        className="input-sharp"
                      />
                    ) : (
                      <p className="text-white/70">${customer.amountOwed.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="gangster-font">DUE DATE</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedCustomer?.dueDate}
                        onChange={(e) =>
                          setEditedCustomer((prev) =>
                            prev ? { ...prev, dueDate: e.target.value } : prev
                          )
                        }
                        className="input-sharp"
                      />
                    ) : (
                      <p className="text-white/70">{customer.dueDate}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="gangster-font">NOTES</Label>
                  {isEditing ? (
                    <Input
                      value={editedCustomer?.notes}
                      onChange={(e) =>
                        setEditedCustomer((prev) =>
                          prev ? { ...prev, notes: e.target.value } : prev
                        )
                      }
                      className="input-sharp"
                    />
                  ) : (
                    <p className="text-white/70">{customer.notes || "No notes"}</p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <div className="space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={() => {
                            setEditedCustomer(customer)
                            setIsEditing(false)
                          }}
                          variant="outline"
                          className="button-sharp"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateCustomer}
                          className="bg-white hover:bg-white/90 text-black button-sharp"
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          className="button-sharp"
                        >
                          Edit Details
                        </Button>
                        <Button
                          onClick={() => setShowPaymentForm(true)}
                          className="bg-white hover:bg-white/90 text-black button-sharp"
                        >
                          Add Payment
                        </Button>
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setShowDeleteAlert(true)}
                      variant="destructive"
                      className="button-sharp"
                    >
                      Delete Customer
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 mt-4">
              <div className="space-y-4">
                {customer.paymentHistory.length === 0 ? (
                  <p className="text-center text-white/70 py-8">No payment history</p>
                ) : (
                  <div className="space-y-4">
                    {customer.paymentHistory.map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-black/20 rounded-md"
                      >
                        <div className="flex items-center space-x-4">
                          <DollarSign className="h-5 w-5 text-white/70" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              ${payment.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-white/70">Method: {payment.method}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-4 w-4 text-white/70" />
                          <p className="text-sm text-white/70">{payment.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full bg-white hover:bg-white/90 text-black button-sharp"
                >
                  Add Payment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-smoke border-white card-sharp">
          <AlertDialogHeader>
            <AlertDialogTitle className="gangster-font text-white">Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="button-sharp">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(customer.id)
                setShowDeleteAlert(false)
              }}
              className="bg-red-600 hover:bg-red-700 button-sharp"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        // onSubmit={handleAddPayment} // Removed: PaymentForm handles submission via server action
        customerId={customer.id}
      />
    </>
  )
}
