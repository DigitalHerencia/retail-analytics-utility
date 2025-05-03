"use client"

import { useState } from "react"
import { HustleTip } from "@/components/hustle-tip"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CustomerList } from "@/features/customer-list"
import CustomerDetails from "@/features/customer-details"
import CustomerForm from "@/features/customer-form"
import PaymentForm from "@/features/payment-form"
import CustomerAnalytics from "@/features/customer-analytics"
import { Plus } from "lucide-react"
import type { Customer, Payment } from "@/types"

interface CustomersTabProps {
  customers: Customer[]
  tenantId: string
  showTips?: boolean
  onHideTips?: () => void
  isLoading?: boolean
}

export default function CustomersTab({
  customers,
  tenantId,
  showTips = true,
  onHideTips,
  isLoading = false,
}: CustomersTabProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [view, setView] = useState<"list" | "analytics">("list")

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="mt-4">Loading customer data...</p>
        </div>
      </div>
    )
  }

  // Handle empty customers state
  if (customers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center p-8">
          <p className="text-center">No customers found. Add your first customer to get started.</p>
          <Button
            onClick={() => setIsAddCustomerOpen(true)}
            className="mt-4 bg-white hover:bg-white/90 text-black button-sharp font-medium flex items-center justify-center"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Customer
          </Button>
        </div>
        {isAddCustomerOpen && (
          <CustomerForm
            isOpen={ isAddCustomerOpen }
            onClose={ () => setIsAddCustomerOpen( false ) } onSave={ function ( customer: Omit<Customer, "id" | "createdAt" | "updatedAt"> ): Promise<void>
            {
              throw new Error( "Function not implemented." )
            } }            // onSave handled by server action in CustomerList
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        {showTips && (
          <HustleTip title="COLLECTING DEBTS">
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
          className="border border-white rounded-md overflow-hidden"
        >
          <ToggleGroupItem
            value="list"
            aria-label="Toggle list view"
            className="data-[state=on]:bg-white data-[state=on]:text-black rounded-none button-sharp px-4 py-2 text-sm"
          >
            List
          </ToggleGroupItem>
          <ToggleGroupItem
            value="analytics"
            aria-label="Toggle analytics view"
            className="data-[state=on]:bg-white data-[state=on]:text-black rounded-none button-sharp px-4 py-2 text-sm"
          >
            Analytics
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Add Client Button - moved from CustomerList */}
        {view === "list" && !selectedCustomer && (
          <Button
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-white hover:bg-white/90 text-black button-sharp font-medium"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Customer
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
              customer={ selectedCustomer! }
              open={ isEditCustomerOpen }
              onOpenChange={ setIsEditCustomerOpen } onDelete={ function ( id: string ): void
              {
                throw new Error( "Function not implemented." )
              } } onAddPayment={ function ( customerId: string, payment: Payment ): void
              {
                throw new Error( "Function not implemented." )
              } } onUpdate={ function ( customer: Customer ): void
              {
                throw new Error( "Function not implemented." )
              } }            // onUpdate handled by server action in CustomerList
            // onDelete handled by server action in CustomerList
            // onAddPayment handled by server action in CustomerList
          />
        </div>
      ) : (
        <CustomerList initialCustomers={customers} tenantId={tenantId} />
      )}

      {/* Add Customer Form */}
      <CustomerForm isOpen={ isAddCustomerOpen } onClose={ () => setIsAddCustomerOpen( false ) } /* onSave handled by CustomerList */ onSave={ function ( customer: Omit<Customer, "id" | "createdAt" | "updatedAt"> ): Promise<void>
      {
        throw new Error( "Function not implemented." )
      } } /* onSave handled by CustomerList */ />

      {/* Edit Customer Form */}
      {selectedCustomer && (
        <CustomerForm
          isOpen={ isEditCustomerOpen }
          onClose={ () => setIsEditCustomerOpen( false ) }
          // onSave handled by CustomerList
          initialData={ selectedCustomer } onSave={ function ( customer: Omit<Customer, "id" | "createdAt" | "updatedAt"> ): Promise<void>
          {
            throw new Error( "Function not implemented." )
          } }        />
      )}

      {/* Payment Form */}
      {selectedCustomer && (
        <PaymentForm
          open={isPaymentOpen}
          onOpenChange={() => setIsPaymentOpen(false)}
          customerId={selectedCustomer.id}
          // onSubmit handled by CustomerList
        />
      )}

      {/* Delete Confirmation Dialog */}
      {/* Dialog logic handled by CustomerList */}
    </div>
  )
}
