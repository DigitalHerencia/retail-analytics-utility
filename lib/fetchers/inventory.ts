"use server";

import sql from "../db";
import { InventoryItem } from "@/types";

export async function getInventory(tenantId: string): Promise<{ inventory: InventoryItem[] }> {
  try {
    const rows = await sql`
      SELECT * FROM inventory 
      WHERE tenant_id = ${tenantId}
      ORDER BY name ASC
    `;

    const inventory = rows.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description || "",
      quantityG: parseFloat(row.quantity_g) || 0,
      quantityOz: parseFloat(row.quantity_oz) || 0,
      quantityKg: parseFloat(row.quantity_kg) || 0,
      costPerOz: parseFloat(row.cost_per_oz) || 0,
      totalCost: parseFloat(row.total_cost) || 0,
      purchaseDate: row.purchase_date instanceof Date 
        ? row.purchase_date.toISOString().split('T')[0] 
        : (typeof row.purchase_date === 'string' ? row.purchase_date : new Date().toISOString().split('T')[0]),
      reorderThresholdG: parseFloat(row.reorder_threshold_g) || 100,
      retailPrice: parseFloat(row.retail_price) || 0
    }));

    return { inventory };
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return { inventory: [] };
  }
}

export async function createInventoryItem(tenantId: string, item: Omit<InventoryItem, "id">) {
  const result = await sql`
    INSERT INTO inventory (
      tenant_id, name, description, quantity_g, quantity_oz, quantity_kg,
      cost_per_oz, total_cost, purchase_date, reorder_threshold_g
    ) VALUES (
      ${tenantId},
      ${item.name},
      ${item.description},
      ${item.quantityG},
      ${item.quantityOz},
      ${item.quantityKg},
      ${item.costPerOz},
      ${item.totalCost},
      ${item.purchaseDate},
      ${item.reorderThresholdG}
    )
    RETURNING *
  `;
  const row = result[0];
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description || "",
    quantityG: parseFloat(row.quantity_g) || 0,
    quantityOz: parseFloat(row.quantity_oz) || 0,
    quantityKg: parseFloat(row.quantity_kg) || 0,
    costPerOz: parseFloat(row.cost_per_oz) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
    purchaseDate: row.purchase_date instanceof Date 
      ? row.purchase_date.toISOString().split('T')[0] 
      : (typeof row.purchase_date === 'string' ? row.purchase_date : new Date().toISOString().split('T')[0]),
    reorderThresholdG: parseFloat(row.reorder_threshold_g) || 100
  };
}

export async function updateInventoryItem(tenantId: string, item: InventoryItem) {
  const result = await sql`
    UPDATE inventory 
    SET 
      name = ${item.name},
      description = ${item.description},
      quantity_g = ${item.quantityG},
      quantity_oz = ${item.quantityOz},
      quantity_kg = ${item.quantityKg},
      cost_per_oz = ${item.costPerOz},
      total_cost = ${item.totalCost},
      purchase_date = ${item.purchaseDate},
      reorder_threshold_g = ${item.reorderThresholdG}
    WHERE tenant_id = ${tenantId} AND id = ${item.id}
    RETURNING *
  `;
  const row = result[0];
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description || "",
    quantityG: parseFloat(row.quantity_g) || 0,
    quantityOz: parseFloat(row.quantity_oz) || 0,
    quantityKg: parseFloat(row.quantity_kg) || 0,
    costPerOz: parseFloat(row.cost_per_oz) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
    purchaseDate: row.purchase_date instanceof Date 
      ? row.purchase_date.toISOString().split('T')[0] 
      : (typeof row.purchase_date === 'string' ? row.purchase_date : new Date().toISOString().split('T')[0]),
    reorderThresholdG: parseFloat(row.reorder_threshold_g) || 100
  };
}

export async function deleteInventoryItem(tenantId: string, itemId: string) {
  await sql`
    DELETE FROM inventory 
    WHERE tenant_id = ${tenantId} AND id = ${itemId}
  `;
}