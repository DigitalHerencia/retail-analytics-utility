'use client'

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import type { Payment } from "@/types"
import { formatCurrency } from "@/lib/utils"

// Extended interface for Accounts Receivable
interface AccountsReceivable {
  id: string
  name: string  // Customer name
  balance: number  // Amount owed
  purchaseDate?: string
  dueDate?: string
  status: "paid" | "unpaid" | "partial"
  paymentHistory: Payment[]
  createdAt: string
  updatedAt: string
  type: "asset" | "liability" | "income" | "expense"
  description: string
}

interface AccountsTableProps {
  accounts: AccountsReceivable[]
  onAddAccount: (account: AccountsReceivable) => void
  onUpdateAccount: (account: AccountsReceivable) => void
  onDeleteAccount: (id: string) => void
  onAddPayment: (accountId: string, payment: Payment) => void
}

const accountFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  balance: z.coerce.number().positive("Amount must be positive"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().min(0, "Description is required"),
  type: z.enum(["asset", "liability", "income", "expense"]),
})

const paymentFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Payment date is required"),
})

export default function AccountsTable({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddPayment,
}: AccountsTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountsReceivable | null>(null)
  const [payingAccount, setPayingAccount] = useState<AccountsReceivable | null>(null)
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null)

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      balance: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      description: "",
      type: "asset",
    },
  })

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    },
  })

  const handleAddAccount = (values: z.infer<typeof accountFormSchema>) => {
    const now = new Date().toISOString();
    const newAccount: AccountsReceivable = {
      id: uuidv4(),
      name: values.name,
      balance: values.balance,
      type: values.type,
      description: values.description ?? "",
      createdAt: now,
      updatedAt: now,
      purchaseDate: values.purchaseDate,
      dueDate: values.dueDate,
      status: "unpaid", // Default status
      paymentHistory: [], // Default empty history
    }

    onAddAccount(newAccount)
    setIsAddDialogOpen(false)
    accountForm.reset()
  }

  const handleEditAccount = (values: z.infer<typeof accountFormSchema>) => {
    if (!editingAccount) return

    const updatedAccount: AccountsReceivable = {
      ...editingAccount,
      name: values.name,
      balance: values.balance,
      purchaseDate: values.purchaseDate,
      dueDate: values.dueDate,
      description: values.description ?? "",
      type: values.type,
      updatedAt: new Date().toISOString(),
    }

    onUpdateAccount(updatedAccount)
    setIsEditDialogOpen(false)
    setEditingAccount(null)
  }

  const handleAddPayment = (values: z.infer<typeof paymentFormSchema>) => {
    if (!payingAccount) return

    const newPayment: Payment = {
      id: uuidv4(),
      date: values.date,
      amount: values.amount,
      method: "",
      createdAt: ""
    }

    onAddPayment(payingAccount.id, newPayment)
    setIsPaymentDialogOpen(false)
    setPayingAccount(null)
    paymentForm.reset()
  }

  const openEditDialog = (account: AccountsReceivable) => {
    setEditingAccount(account)
    accountForm.reset({
      name: account.name,
      balance: account.balance,
      purchaseDate: account.purchaseDate || new Date().toISOString().split("T")[0],
      dueDate: account.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: account.description ?? "",
      type: account.type,
    })
    setIsEditDialogOpen(true)
  }

  const openPaymentDialog = (account: AccountsReceivable) => {
    setPayingAccount(account)
    paymentForm.reset({
      amount: account.balance, // Default payment amount to remaining balance
      date: new Date().toISOString().split("T")[0],
    })
    setIsPaymentDialogOpen(true)
  }

  const toggleExpandAccount = (accountId: string) => {
    setExpandedAccountId(expandedAccountId === accountId ? null : accountId)
  }

  const totalReceivables = accounts.reduce((sum, account) => sum + account.balance, 0)
  const overdueAccounts = accounts.filter(
    (account) => account.status !== "paid" && account.dueDate && new Date(account.dueDate) < new Date(),
  )
  const totalOverdue = overdueAccounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Accounts Receivable</CardTitle>
            <CardDescription>Track customer accounts and payments</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>Enter the details of the new customer account.</DialogDescription>
              </DialogHeader>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(handleAddAccount)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Owed</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={accountForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Type field might be needed if you want to set it on creation */}
                  <DialogFooter>
                    <Button type="submit">Add Account</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
                <p className="text-sm text-muted-foreground">Total Receivables</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{overdueAccounts.length}</div>
                <p className="text-sm text-muted-foreground">Overdue Accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(totalOverdue)}</div>
                <p className="text-sm text-muted-foreground">Total Overdue Amount</p>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead> {/* For expand button */}
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No accounts found. Add an account to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <>
                      <TableRow key={account.id}>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toggleExpandAccount(account.id)}>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedAccountId === account.id ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{formatCurrency(account.balance)}</TableCell>
                        <TableCell>{account.purchaseDate}</TableCell>
                        <TableCell>{account.dueDate}</TableCell>
                        <TableCell>
                          {account.status === "paid" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Paid
                            </Badge>
                          ) : account.status === "partial" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Partial
                            </Badge>
                          ) : account.dueDate && new Date(account.dueDate) < new Date() ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : (
                            <Badge variant="outline">Unpaid</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openPaymentDialog(account)}
                              disabled={account.status === "paid"}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(account)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => onDeleteAccount(account.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedAccountId === account.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Payment History</h4>
                              {account.paymentHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No payment history available.</p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {account.paymentHistory.map((payment) => (
                                      <TableRow key={payment.id}>
                                        <TableCell>{payment.date}</TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update the details of this customer account.</DialogDescription>
          </DialogHeader>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(handleEditAccount)} className="space-y-4">
              <FormField
                control={accountForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Owed</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={accountForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Type field might be needed if you want to edit it */}
              <DialogFooter>
                <Button type="submit">Update Account</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {payingAccount?.name || "this customer"}.
            </DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handleAddPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Current balance: {formatCurrency(payingAccount?.balance || 0)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Record Payment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
