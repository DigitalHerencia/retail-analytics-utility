"use server";

import sql from "../db/db";
import { BusinessData } from "@/types";
import { auth } from "@clerk/nextjs/server";

export async function getBusinessData(tenantId: string): Promise<{ businessData: BusinessData }> {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const result = await sql`
    SELECT value FROM saved_data 
    WHERE user_id = ${userId} AND key = 'business'
    LIMIT 1
  `;

  const businessData = result[0]?.value ? JSON.parse(result[0].value) : getBusinessData;
  return { businessData };
}

export async function saveBusinessData(tenantId: string, data: BusinessData) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  await sql`
    INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
    VALUES (${userId}, 'business', ${JSON.stringify(data)}, NOW(), NOW())
    ON CONFLICT (user_id, key)
    DO UPDATE SET value = ${JSON.stringify(data)}, updated_at = NOW()
  `;

  return { success: true };
}

export async function saveAllBusinessData(tenantId: string, data: {
  businessData?: any;
  inventory?: any;
  customers?: any;
  transactions?: any;
  scenarios?: any;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const promises = [];
  const now = new Date().toISOString();
  
  if (data.businessData) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
      VALUES (${userId}, 'business', ${JSON.stringify(data.businessData)}, ${now}, ${now})
      ON CONFLICT (user_id, key)
      DO UPDATE SET value = ${JSON.stringify(data.businessData)}, updated_at = ${now}
    `);
  }

  if (data.inventory) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
      VALUES (${userId}, 'inventory', ${JSON.stringify(data.inventory)}, ${now}, ${now})
      ON CONFLICT (user_id, key)
      DO UPDATE SET value = ${JSON.stringify(data.inventory)}, updated_at = ${now}
    `);
  }

  if (data.customers) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
      VALUES (${userId}, 'customers', ${JSON.stringify(data.customers)}, ${now}, ${now})
      ON CONFLICT (user_id, key)
      DO UPDATE SET value = ${JSON.stringify(data.customers)}, updated_at = ${now}
    `);
  }

  if (data.transactions) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
      VALUES (${userId}, 'transactions', ${JSON.stringify(data.transactions)}, ${now}, ${now})
      ON CONFLICT (user_id, key)
      DO UPDATE SET value = ${JSON.stringify(data.transactions)}, updated_at = ${now}
    `);
  }

  if (data.scenarios) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
      VALUES (${userId}, 'scenarios', ${JSON.stringify(data.scenarios)}, ${now}, ${now})
      ON CONFLICT (user_id, key)
      DO UPDATE SET value = ${JSON.stringify(data.scenarios)}, updated_at = ${now}
    `);
  }

  await Promise.all(promises);
  return { success: true };
}