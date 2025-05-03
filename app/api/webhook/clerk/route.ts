import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { sql } from "@vercel/postgres"; // Corrected import assuming @vercel/postgres
import { clerkClient } from '@clerk/nextjs/server'; // Import clerkClient

// This is the webhook handler for Clerk events
// It processes events like user creation, updates, and deletions

export async function POST(req: NextRequest) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify the webhook signature
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  
  // If there are missing Svix headers, return 400
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  // Create a new Svix instance with the webhook secret
  const webhook = new Webhook(WEBHOOK_SECRET);
  
  try {
    // Verify the signature
    webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle different event types
  const { type, data } = payload;
  
  try {
    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;
      case "user.updated":
        await handleUserUpdated(data);
        break;
      case "user.deleted":
        await handleUserDeleted(data);
        break;
      // Add more event types as needed
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Helper functions to handle different event types

async function handleUserCreated(userData: any) {
  // Extract relevant user data from Clerk's payload
  const { id, email_addresses, username, first_name, last_name } = userData;
  const primaryEmail = email_addresses?.[0]?.email_address;

  // --- Tenant Assignment Logic ---
  // Option 1: Create a new tenant for each user (Example)
  const tenantName = `${first_name || username || 'User'}'s Tenant`;
  let tenantId: string;
  try {
    // Ensure the sql function returns an object with 'rows'
    const result = await sql`INSERT INTO tenants (name) VALUES (${tenantName}) RETURNING tenant_id;`;
    // Check if rows exist and have data
    if (result.rows && result.rows.length > 0) {
        tenantId = result.rows[0].tenant_id;
        console.log(`Created new tenant '${tenantName}' with ID: ${tenantId} for user ${id}`);
    } else {
        console.error("Tenant creation query did not return tenant_id.");
        // Assign a fallback if the query structure is unexpected
        tenantId = 'fallback-tenant-' + Math.random().toString(36).substring(2, 9);
        console.warn(`Assigned temporary fallback tenant ID: ${tenantId} due to unexpected DB response.`);
    }
  } catch (dbError) {
    console.error("Database error creating tenant:", dbError);
    // Assign a temporary fallback if DB fails to create tenant
    tenantId = 'fallback-tenant-' + Math.random().toString(36).substring(2, 9);
    console.warn(`Assigned temporary fallback tenant ID: ${tenantId} due to DB error.`);
  }
  // --- End Tenant Assignment ---

  // Insert the new user into your database with the assigned tenant_id
  try {
    await sql`
      INSERT INTO users (clerk_id, email, username, first_name, last_name, tenant_id)
      VALUES (${id}, ${primaryEmail}, ${username || primaryEmail}, ${first_name || null}, ${last_name || null}, ${tenantId})
      ON CONFLICT (clerk_id) DO NOTHING;
    `;
  } catch (error) {
    console.error("Error creating user record:", error);
    // Don't re-throw yet, try updating Clerk metadata anyway
  }

  // --- Update Clerk User Metadata ---
  try {
    // Correctly call clerkClient if it's a function returning the client
    const client = await clerkClient();
    await client.users.updateUser(id, {
      publicMetadata: {
        tenantId: tenantId, // Store the assigned tenantId here
      },
    });
    console.log(`Stored tenantId ${tenantId} in Clerk publicMetadata for user ${id}`);
  } catch (clerkError) {
    console.error(`Error updating Clerk user ${id} publicMetadata:`, clerkError);
    // Decide how to handle this - maybe retry later?
    // For now, we'll just log the error. The user exists in the DB but not in Clerk metadata.
  }
  // --- End Clerk Update ---
}

async function handleUserUpdated(userData: any) {
  // Extract relevant user data from Clerk's payload
  // Use different variable names to avoid conflict with const declarations
  const { id: clerkUserId, email_addresses, username: clerkUsername, first_name: clerkFirstName, last_name: clerkLastName } = userData;
  const primaryEmail = email_addresses?.[0]?.email_address;

  // Update the user in your database
  try {
    await sql`
      UPDATE users
      SET 
        email = ${primaryEmail},
        username = ${clerkUsername || primaryEmail},
        first_name = ${clerkFirstName || null},
        last_name = ${clerkLastName || null},
        updated_at = NOW()
      WHERE clerk_id = ${clerkUserId};
    `;
  } catch (error) {
    console.error("Error updating user record:", error);
    throw error; // Re-throw error after logging
  }
}

async function handleUserDeleted(userData: any) {
  // Extract the user ID from Clerk's payload
  const { id: clerkUserId } = userData;

  // Mark the user as deleted in your database or actually delete them
  // depending on your application's requirements
  try {
    await sql`
      UPDATE users
      SET is_deleted = true, updated_at = NOW()
      WHERE clerk_id = ${clerkUserId};
    `;
    
    // If you want to actually delete the user instead, use this:
    // await sql`DELETE FROM users WHERE clerk_id = ${id};`;
  } catch (error) {
    console.error("Error deleting user record:", error);
    throw error; // Re-throw error after logging
  }
}

// Add OPTIONS handler for CORS support
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, svix-id, svix-signature, svix-timestamp',
      'Access-Control-Max-Age': '86400',
    },
  });
}