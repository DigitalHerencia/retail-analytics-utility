"use server";

import sql from "../db";
import { Transaction } from "@/types";

export async function getTransactions(tenantId: string): Promise<{ transactions: Transaction[] }> {
  const rows = await sql`
    SELECT t.*, 
           i.name as inventory_name,
           c.name as customer_name
    FROM transactions t
    LEFT JOIN inventory i ON t.inventory_id = i.id
    LEFT JOIN customers c ON t.customer_id = c.id
    WHERE t.tenant_id = ${tenantId}
    ORDER BY date DESC
  `;

  const transactions = rows.map(row => ({
    id: row.id,
    date: row.date,
    type: row.type as "sale" | "payment" | "purchase",
    inventoryId: row.inventory_id,
    inventoryName: row.inventory_name,
    quantityGrams: parseFloat(row.quantity_grams) || 0,
    pricePerGram: parseFloat(row.price_per_gram) || 0,
    totalPrice: parseFloat(row.total_price) || 0,
    cost: parseFloat(row.cost) || 0,
    profit: parseFloat(row.profit) || 0,
    paymentMethod: row.payment_method || "",
    customerId: row.customer_id,
    customerName: row.customer_name,
    notes: row.notes || "",
    createdAt: row.created_at
  }));

  return { transactions };
}

export async function createTransaction(tenantId: string, transaction: Omit<Transaction, "id" | "createdAt">) {
  const result = await sql`
    INSERT INTO transactions (
      tenant_id, date, type, inventory_id, quantity_grams,
      price_per_gram, total_price, cost, profit, payment_method,
      customer_id, notes, created_at
    ) VALUES (
      ${tenantId},
      ${transaction.date},
      ${transaction.type},
      ${transaction.inventoryId},
      ${transaction.quantityGrams.toString()},
      ${transaction.pricePerGram.toString()},
      ${transaction.totalPrice.toString()},
      ${transaction.cost.toString()},
      ${transaction.profit.toString()},
      ${transaction.paymentMethod},
      ${transaction.customerId},
      ${transaction.notes},
      ${new Date().toISOString()}
    )
    RETURNING *
  `;

  // If it's a sale or purchase, update inventory quantities
  if (transaction.type !== "payment" && transaction.inventoryId) {
    const quantityChange = transaction.type === "sale" ? -transaction.quantityGrams : transaction.quantityGrams;
    
    await sql`
      UPDATE inventory
      SET quantity_g = CAST(quantity_g AS DECIMAL) + ${quantityChange}
      WHERE id = ${transaction.inventoryId} AND tenant_id = ${tenantId}
    `;
  }

  return result[0];
}

export async function deleteTransaction(tenantId: string, transactionId: string) {
  // First, get the transaction details to revert inventory if needed
  const transaction = (await sql`
    SELECT * FROM transactions 
    WHERE tenant_id = ${tenantId} AND id = ${transactionId}
  `)[0];

  if (transaction && transaction.type !== "payment" && transaction.inventory_id) {
    // Revert the inventory change
    const quantityChange = transaction.type === "sale" ? 
      parseFloat(transaction.quantity_grams) : 
      -parseFloat(transaction.quantity_grams);

    await sql`
      UPDATE inventory
      SET quantity_g = CAST(quantity_g AS DECIMAL) + ${quantityChange}
      WHERE id = ${transaction.inventory_id} AND tenant_id = ${tenantId}
    `;
  }

  // Delete the transaction
  await sql`
    DELETE FROM transactions 
    WHERE tenant_id = ${tenantId} AND id = ${transactionId}
  `;
}