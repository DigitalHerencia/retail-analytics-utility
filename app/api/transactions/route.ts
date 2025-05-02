import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// GET: fetch transactions for a tenant
export async function GET(req: NextRequest) {
  const tenant_id = req.nextUrl.searchParams.get("tenant_id");
  if (!tenant_id) return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
  const rows = await sql`SELECT * FROM transactions WHERE tenant_id = ${tenant_id}`;
  return NextResponse.json({ transactions: rows });
}

// POST: add transaction
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, ...transaction } = body;
  if (!tenant_id) return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
  await sql`
    INSERT INTO transactions (id, tenant_id, customer_id, inventory_id, quantity, total, transaction_date)
    VALUES (
      ${transaction.id}, ${tenant_id}, ${transaction.customer_id || null}, ${transaction.inventory_id || null},
      ${transaction.quantity}, ${transaction.total}, ${transaction.transaction_date || new Date().toISOString()}
    )
    ON CONFLICT (id) DO NOTHING;
  `;
  return NextResponse.json({ success: true });
}

// PUT: update transaction
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, id, ...transaction } = body;
  if (!tenant_id || !id) return NextResponse.json({ error: "Missing tenant_id or id" }, { status: 400 });
  await sql`
    UPDATE transactions SET
      customer_id = ${transaction.customer_id || null},
      inventory_id = ${transaction.inventory_id || null},
      quantity = ${transaction.quantity},
      total = ${transaction.total},
      transaction_date = ${transaction.transaction_date || new Date().toISOString()}
    WHERE id = ${id} AND tenant_id = ${tenant_id}
  `;
  return NextResponse.json({ success: true });
}

// DELETE: delete transaction
export async function DELETE(req: NextRequest) {
  const tenant_id = req.nextUrl.searchParams.get("tenant_id");
  const id = req.nextUrl.searchParams.get("id");
  if (!tenant_id || !id) return NextResponse.json({ error: "Missing tenant_id or id" }, { status: 400 });
  await sql`DELETE FROM transactions WHERE id = ${id} AND tenant_id = ${tenant_id}`;
  return NextResponse.json({ success: true });
}
