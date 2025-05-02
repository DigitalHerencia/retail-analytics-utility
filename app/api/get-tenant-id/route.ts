import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import sql from "@/lib/db";

// GET: get a tenant ID (uses a default for development or fetches from user session)
export async function GET(req: NextRequest) {
  // In a real app, this would come from authentication/session
  // For now, we'll use a default or create one if it doesn't exist
  let tenantId = "default-tenant";
  
  // In production, you would get this from user authentication
  // const session = await getServerSession();
  // tenantId = session?.user?.tenantId || "default-tenant";
  
  return NextResponse.json({ tenantId });
}

// POST: add customer
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, ...customer } = body;
  if (!tenant_id) return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
  await sql`
    INSERT INTO customers (id, tenant_id, name, email, phone, notes, created_at)
    VALUES (
      ${customer.id}, ${tenant_id}, ${customer.name}, ${customer.email || null}, ${customer.phone || null},
      ${customer.notes || null}, NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  `;
  return NextResponse.json({ success: true });
}

// PUT: update customer
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, id, ...customer } = body;
  if (!tenant_id || !id) return NextResponse.json({ error: "Missing tenant_id or id" }, { status: 400 });
  await sql`
    UPDATE customers SET
      name = ${customer.name},
      email = ${customer.email || null},
      phone = ${customer.phone || null},
      notes = ${customer.notes || null}
    WHERE id = ${id} AND tenant_id = ${tenant_id}
  `;
  return NextResponse.json({ success: true });
}

// DELETE: delete customer
export async function DELETE(req: NextRequest) {
  const tenant_id = req.nextUrl.searchParams.get("tenant_id");
  const id = req.nextUrl.searchParams.get("id");
  if (!tenant_id || !id) return NextResponse.json({ error: "Missing tenant_id or id" }, { status: 400 });
  await sql`DELETE FROM customers WHERE id = ${id} AND tenant_id = ${tenant_id}`;
  return NextResponse.json({ success: true });
}
