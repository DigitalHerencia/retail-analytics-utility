import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// GET: fetch inventory for a tenant
export async function GET(req: NextRequest) {
  const tenant_id = req.nextUrl.searchParams.get("tenant_id");
  if (!tenant_id) return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
  const rows = await sql`SELECT * FROM inventory WHERE tenant_id = ${tenant_id}`;
  return NextResponse.json({ inventory: rows });
}

// POST: add inventory item
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, ...item } = body;
  if (!tenant_id) return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
  await sql`
    INSERT INTO inventory (id, tenant_id, name, sku, category, quantity, price, cost, created_at)
    VALUES (
      ${item.id}, ${tenant_id}, ${item.name}, ${item.sku || null}, ${item.category || null},
      ${item.quantity}, ${item.price}, ${item.cost}, NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  `;
  return NextResponse.json({ success: true });
}

// PUT: update inventory item
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, id, ...item } = body;
  if (!tenant_id || !id) return NextResponse.json({ error: "Missing tenant_id or id" }, { status: 400 });
  await sql`
    UPDATE inventory SET
      name = ${item.name},
      sku = ${item.sku || null},
      category = ${item.category || null},
      quantity = ${item.quantity},
      price = ${item.price},
      cost = ${item.cost}
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
