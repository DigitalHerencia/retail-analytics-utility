'use server'
import type { Payment } from '@/types'

export async function addPayment(customerId: string, formData: FormData) {
  // You should implement logic to persist the payment for the customer here.
  // Example:
  // 1. Parse formData to get payment fields.
  // 2. Create a Payment object.
  // 3. Save to your database or data store.
  // 4. Optionally, return the new payment or a status.

  // Example parsing:
  const payment: Payment = {
    id: crypto.randomUUID(),
    amount: Number(formData.get('amount')),
    method: String(formData.get('method')),
    date: String(formData.get('date')),
    notes: String(formData.get('notes') || ''),
    createdAt: new Date().toISOString(),
  }
  // TODO: Save payment to customer with customerId
  return payment
}