"use server";

import sql from "../db";
import { InventoryItem } from "@/types";

export async function getInventory(tenantId: string): Promise<{ inventory: InventoryItem[] }> {
  const rows = await sql`
    SELECT * FROM inventory 
    WHERE tenant_id = ${tenantId}
    ORDER BY name ASC
  `;

  const inventory = rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    quantityG: parseFloat(row.quantity_g) || 0,
    quantityOz: parseFloat(row.quantity_oz) || 0,
    quantityKg: parseFloat(row.quantity_kg) || 0,
    costPerOz: parseFloat(row.cost_per_oz) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
    purchaseDate: row.purchase_date || new Date().toISOString().split("T")[0],
    reorderThresholdG: parseFloat(row.reorder_threshold_g) || 100
  }));

  return { inventory };
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
      ${item.quantityG.toString()},
      ${item.quantityOz.toString()},
      ${item.quantityKg.toString()},
      ${item.costPerOz.toString()},
      ${item.totalCost.toString()},
      ${item.purchaseDate},
      ${item.reorderThresholdG.toString()}
    )
    RETURNING *
  `;

  return result[0];
}

export async function updateInventoryItem(tenantId: string, item: InventoryItem) {
  const result = await sql`
    UPDATE inventory 
    SET 
      name = ${item.name},
      description = ${item.description},
      quantity_g = ${item.quantityG.toString()},
      quantity_oz = ${item.quantityOz.toString()},
      quantity_kg = ${item.quantityKg.toString()},
      cost_per_oz = ${item.costPerOz.toString()},
      total_cost = ${item.totalCost.toString()},
      purchase_date = ${item.purchaseDate},
      reorder_threshold_g = ${item.reorderThresholdG.toString()}
    WHERE tenant_id = ${tenantId} AND id = ${item.id}
    RETURNING *
  `;

  return result[0];
}

export async function deleteInventoryItem(tenantId: string, itemId: string) {
  await sql`
    DELETE FROM inventory 
    WHERE tenant_id = ${tenantId} AND id = ${itemId}
  `;
}