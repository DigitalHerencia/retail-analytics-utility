"use server";

import sql from "../db";
import { Customer, Payment } from "@/types";

export async function getCustomers(tenantId: string): Promise<{ customers: Customer[] }> {
  const rows = await sql`
    SELECT * FROM customers 
    WHERE tenant_id = ${tenantId}
    ORDER BY name ASC
  `;

  const customers = rows.map(row => {
    // safely parse payment history
    let paymentHistory: Payment[];
    try {
      const raw = row.payment_history?.trim() || "[]";
      paymentHistory = JSON.parse(raw) as Payment[];
    } catch {
      paymentHistory = [];
    }
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      phone: row.phone || "",
      email: row.email || "",
      address: row.address || "",
      amountOwed: parseFloat(row.amount_owed) || 0,
      dueDate: row.due_date || new Date().toISOString().split("T")[0],
      status: row.status as "paid" | "unpaid" | "partial",
      paymentHistory,
      notes: row.notes || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  });

  return { customers };
}

export async function createCustomer(tenantId: string, customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  
  const result = await sql`
    INSERT INTO customers (
      tenant_id, name, phone, email, address, amount_owed,
      due_date, status, payment_history, notes, created_at, updated_at
    ) VALUES (
      ${tenantId},
      ${customer.name},
      ${customer.phone},
      ${customer.email},
      ${customer.address},
      ${customer.amountOwed.toString()},
      ${customer.dueDate},
      ${customer.status},
      ${JSON.stringify(customer.paymentHistory)},
      ${customer.notes},
      ${now},
      ${now}
    )
    RETURNING *
  `;

  const row = result[0];
  let paymentHistory: Payment[];
  try {
    const raw = row.payment_history?.trim() || "[]";
    paymentHistory = JSON.parse(raw) as Payment[];
  } catch {
    paymentHistory = [];
  }
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    amountOwed: parseFloat(row.amount_owed) || 0,
    dueDate: row.due_date || new Date().toISOString().split("T")[0],
    status: row.status as "paid" | "unpaid" | "partial",
    paymentHistory,
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateCustomer(tenantId: string, customer: Customer) {
  const result = await sql`
    UPDATE customers 
    SET 
      name = ${customer.name},
      phone = ${customer.phone},
      email = ${customer.email},
      address = ${customer.address},
      amount_owed = ${customer.amountOwed.toString()},
      due_date = ${customer.dueDate},
      status = ${customer.status},
      payment_history = ${JSON.stringify(customer.paymentHistory)},
      notes = ${customer.notes},
      updated_at = ${new Date().toISOString()}
    WHERE tenant_id = ${tenantId} AND id = ${customer.id}
    RETURNING *
  `;

  const row = result[0];
  let paymentHistory: Payment[];
  try {
    const raw = row.payment_history?.trim() || "[]";
    paymentHistory = JSON.parse(raw) as Payment[];
  } catch {
    paymentHistory = [];
  }
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    amountOwed: parseFloat(row.amount_owed) || 0,
    dueDate: row.due_date || new Date().toISOString().split("T")[0],
    status: row.status as "paid" | "unpaid" | "partial",
    paymentHistory,
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function deleteCustomer(tenantId: string, customerId: string) {
  await sql`
    DELETE FROM customers 
    WHERE tenant_id = ${tenantId} AND id = ${customerId}
  `;
}

export async function addCustomerPayment(tenantId: string, customerId: string, payment: Payment) {
  const customer = (await sql`
    SELECT * FROM customers WHERE tenant_id = ${tenantId} AND id = ${customerId}
  `)[0];

  if (!customer) throw new Error("Customer not found");

  let paymentHistory: Payment[];
  try {
    const raw = customer.payment_history?.trim() || "[]";
    paymentHistory = JSON.parse(raw) as Payment[];
  } catch {
    paymentHistory = [];
  }
  paymentHistory.push(payment);

  // Recalculate amount owed
  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const amountOwed = Math.max(0, parseFloat(customer.amount_owed) - totalPaid);
  
  // Update status based on payment
  const status = amountOwed === 0 ? "paid" : totalPaid > 0 ? "partial" : "unpaid";

  await sql`
    UPDATE customers 
    SET 
      payment_history = ${JSON.stringify(paymentHistory)},
      amount_owed = ${amountOwed.toString()},
      status = ${status},
      updated_at = ${new Date().toISOString()}
    WHERE tenant_id = ${tenantId} AND id = ${customerId}
  `;
}