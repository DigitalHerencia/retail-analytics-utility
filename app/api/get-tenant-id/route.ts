import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });
    // Find the user's tenant_id
    const result = await sql`SELECT tenant_id FROM users WHERE username = ${username} LIMIT 1`;
    if (result.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ tenant_id: result[0].tenant_id });
  } catch (e) {
    console.error("Error fetching tenant_id:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Adding OPTIONS handler to support CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}