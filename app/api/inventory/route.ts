import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

// GET: fetch inventory for a tenant
export async function GET(req: NextRequest) {
  const tenant_id = req.nextUrl.searchParams.get("tenant_id");
  if (!tenant_id) return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
  const rows = await sql`SELECT * FROM inventory WHERE tenant_id = ${tenant_id}`;
  
  // Map database rows to match frontend model
  const inventory = rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    quantityG: row.quantity_g || 0,
    quantityOz: row.quantity_oz || 0,
    quantityKg: row.quantity_kg || 0,
    costPerOz: row.cost_per_oz || 0,
    totalCost: row.total_cost || 0,
    purchaseDate: row.purchase_date || new Date().toISOString().split("T")[0],
    reorderThresholdG: row.reorder_threshold_g || 100
  }));
  
  return NextResponse.json({ inventory });
}

// POST: add inventory item
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, ...item } = body;
  if (!tenant_id) return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
  
  const id = item.id || uuidv4();
  
  await sql`
    INSERT INTO inventory (
      id, tenant_id, name, description, quantity_g, quantity_oz, quantity_kg, 
      cost_per_oz, total_cost, purchase_date, reorder_threshold_g, created_at
    )
    VALUES (
      ${id}, ${tenant_id}, ${item.name}, ${item.description || ""}, 
      ${item.quantityG || 0}, ${item.quantityOz || 0}, ${item.quantityKg || 0},
      ${item.costPerOz || 0}, ${item.totalCost || 0}, ${item.purchaseDate}, 
      ${item.reorderThresholdG || 100}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = ${item.name},
      description = ${item.description || ""},
      quantity_g = ${item.quantityG || 0},
      quantity_oz = ${item.quantityOz || 0},
      quantity_kg = ${item.quantityKg || 0},
      cost_per_oz = ${item.costPerOz || 0},
      total_cost = ${item.totalCost || 0},
      purchase_date = ${item.purchaseDate},
      reorder_threshold_g = ${item.reorderThresholdG || 100}
  `;
  
  return NextResponse.json({ success: true, id });
}

// PUT: update inventory item
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, id, ...item } = body;
  if (!tenant_id || !id) return NextResponse.json({ error: "Missing tenant_id or id" }, { status: 400 });
  
  await sql`
    UPDATE inventory SET
      name = ${item.name},
      description = ${item.description || ""},
      quantity_g = ${item.quantityG || 0},
      quantity_oz = ${item.quantityOz || 0},
      quantity_kg = ${item.quantityKg || 0},
      cost_per_oz = ${item.costPerOz || 0},
      total_cost = ${item.totalCost || 0},
      purchase_date = ${item.purchaseDate},
      reorder_threshold_g = ${item.reorderThresholdG || 100}
    WHERE id = ${id} AND tenant_id = ${tenant_id}
  `;
  
  return NextResponse.json({ success: true });
}

// DELETE: delete inventory item
export async function DELETE(req: NextRequest) {
  const tenant_id = req.nextUrl.searchParams.get("tenant_id");
  const id = req.nextUrl.searchParams.get("id");
  if (!tenant_id || !id) return NextResponse.json({ error: "Missing tenant_id or id" }, { status: 400 });
  
  await sql`DELETE FROM inventory WHERE id = ${id} AND tenant_id = ${tenant_id}`;
  
  return NextResponse.json({ success: true });
}
