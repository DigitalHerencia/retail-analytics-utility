"use client"

import { useState } from "react"
import { HustleTip } from "@/components/hustle-tip"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import CustomerList from "@/components/customer-list"
import CustomerDetails from "@/components/customer-details"
import CustomerForm from "@/components/customer-form"
import PaymentForm from "@/components/payment-form"
import CustomerAnalytics from "@/components/customer-analytics"
import { Plus } from "lucide-react"
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
import type { Customer, Payment } from "@/lib/data"

interface CustomersTabProps {
  customers: Customer[]
  onUpdateCustomers: (customers: Customer[]) => void
  showTips: boolean // Keep showTips property
  onHideTips: () => void // Keep onHideTips property
}

export default function CustomersTab({
  customers,
  onUpdateCustomers,
  showTips, // Destructure showTips
  onHideTips, // Destructure onHideTips
}: CustomersTabProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [view, setView] = useState<"list" | "analytics">("list")

  // Handle adding a new customer
  const handleAddCustomer = (customer: Customer) => {
    onUpdateCustomers([...customers, customer])
  }

  // Handle updating a customer
  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    onUpdateCustomers(customers.map((customer) => (customer.id === updatedCustomer.id ? updatedCustomer : customer)))
    setSelectedCustomer(updatedCustomer)
  }

  // Handle deleting a customer
  const handleDeleteCustomer = () => {
    if (!selectedCustomer) return

    onUpdateCustomers(customers.filter((customer) => customer.id !== selectedCustomer.id))
    setSelectedCustomer(null)
    setIsDeleteDialogOpen(false)
  }

  // Handle adding a payment
  const handleAddPayment = (payment: Payment) => {
    if (!selectedCustomer) return

    // Calculate remaining amount after payment
    const newAmountOwed = Math.max(0, selectedCustomer.amountOwed - payment.amount)

    // Determine new status
    let newStatus: "paid" | "partial" | "unpaid" = "unpaid"
    if (newAmountOwed === 0) {
      newStatus = "paid"
    } else if (payment.amount > 0) {
      newStatus = "partial"
    }

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      amountOwed: newAmountOwed,
      status: newStatus,
      paymentHistory: [...selectedCustomer.paymentHistory, payment],
      updatedAt: new Date().toISOString(),
    }

    handleUpdateCustomer(updatedCustomer)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-gold border-2">
          <h1 className="text-4xl font-bold text-gold gangster-font text-shadow">CLIENTS</h1>
          <p className="text-white/80 mt-1">GET YOUR MONEY. NO EXCEPTIONS.</p>
        </div>

        {showTips && ( // Conditionally render the tip
          <HustleTip title="COLLECTING DEBTS"> {/* Removed onDismiss prop */}
            <p>
              Track who owes you and when it's due. In this game, respect comes from getting paid on time. Always follow
              up on late payments - money owed is money lost until it's in your pocket.
            </p>
          </HustleTip>
        )}
      </div>

      {/* New Header Row with Toggle and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value as "list" | "analytics")
          }}
          className="border border-gold rounded-md overflow-hidden"
        >
          <ToggleGroupItem
            value="list"
            aria-label="Toggle list view"
            className="data-[state=on]:bg-gold data-[state=on]:text-black rounded-none button-sharp px-4 py-2 text-sm"
          >
            List
          </ToggleGroupItem>
          <ToggleGroupItem
            value="analytics"
            aria-label="Toggle analytics view"
            className="data-[state=on]:bg-gold data-[state=on]:text-black rounded-none button-sharp px-4 py-2 text-sm border-l border-gold"
          >
            Analytics
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Add Client Button - moved from CustomerList */}
        {view === "list" && !selectedCustomer && (
          <Button
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-gold hover:bg-gold/90 text-black button-sharp"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        )}
      </div>

      {/* Conditional Rendering based on view state */}
      {view === "analytics" ? (
        <CustomerAnalytics customers={customers} />
      ) : selectedCustomer ? (
        <div className="space-y-4">
          <Button variant="outline" className="button-sharp" onClick={() => setSelectedCustomer(null)}>
            ← BACK TO CLIENT LIST
          </Button>

          <CustomerDetails
            customer={selectedCustomer}
            onEdit={() => setIsEditCustomerOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onAddPayment={() => setIsPaymentOpen(true)}
          />
        </div>
      ) : (
        <CustomerList
          customers={customers}
          onSelectCustomer={setSelectedCustomer}
        />
      )}

      {/* Add Customer Form */}
      <CustomerForm isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} onSave={handleAddCustomer} />

      {/* Edit Customer Form */}
      {selectedCustomer && (
        <CustomerForm
          isOpen={isEditCustomerOpen}
          onClose={() => setIsEditCustomerOpen(false)}
          onSave={handleUpdateCustomer}
          initialData={selectedCustomer}
        />
      )}

      {/* Payment Form */}
      {selectedCustomer && (
        <PaymentForm
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSave={handleAddPayment}
          customer={selectedCustomer}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-smoke border-gold card-sharp">
          <AlertDialogHeader>
            <AlertDialogTitle className="gangster-font text-gold">DELETE CLIENT</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
              {(selectedCustomer?.amountOwed || 0) > 0 && (
                <span className="block mt-2 text-blood">
                  Warning: This client still owes {selectedCustomer?.amountOwed?.toFixed(2)}. Deleting will remove all
                  payment records.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="button-sharp">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-blood hover:bg-blood/90 text-white button-sharp"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
