import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Calendar, DollarSign } from "lucide-react"
import { getCustomers } from "@/lib/fetchers/customers"

export default async function CustomerDetailsPage({ params }: { params: { customerId: string } }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  const { customers } = await getCustomers(userId)
  const customer = customers.find(c => c.id === params.customerId)
  if (!customer) return notFound()

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold gangster-font text-white">Customer Details</h1>
      </div>
      <div className="bg-smoke border-white card-sharp p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-white/70">Name</div>
            <div className="text-white text-lg">{customer.name}</div>
          </div>
          <div>
            <div className="font-semibold text-white/70">Email</div>
            <div className="text-white">{customer.email}</div>
          </div>
          <div>
            <div className="font-semibold text-white/70">Phone</div>
            <div className="text-white">{customer.phone}</div>
          </div>
          <div>
            <div className="font-semibold text-white/70">Address</div>
            <div className="text-white">{customer.address || "No address provided"}</div>
          </div>
          <div>
            <div className="font-semibold text-white/70">Amount Owed</div>
            <div className="text-white font-bold">{formatCurrency(customer.amountOwed)}</div>
          </div>
          <div>
            <div className="font-semibold text-white/70">Due Date</div>
            <div className="text-white">{(() => {
              const d = new Date(customer.dueDate as string)
              return isNaN(d.getTime()) ? customer.dueDate : d.toLocaleDateString()
            })()}</div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-white/70 mb-2">Notes</div>
          <div className="text-white">{customer.notes || "No notes"}</div>
        </div>
        <div>
          <div className="font-semibold text-white/70 mb-2">Payment History</div>
          {customer.paymentHistory.length === 0 ? (
            <div className="text-white/60">No payment history</div>
          ) : (
            <div className="space-y-2">
              {customer.paymentHistory.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-md">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-white/70" />
                    <span className="text-white font-medium">{formatCurrency(payment.amount)}</span>
                    <span className="text-xs text-white/70">Method: {payment.method}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-white/70" />
                    <span className="text-white/70 text-sm">{(() => {
                      const d = new Date(payment.date as string)
                      return isNaN(d.getTime()) ? payment.date : d.toLocaleDateString()
                    })()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

