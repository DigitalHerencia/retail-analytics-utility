"use server";

import sql from "../db";
import { BusinessData } from "@/types";
import { auth } from "@clerk/nextjs/server";

export async function getBusinessData(tenantId: string): Promise<{ businessData: BusinessData }> {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const result = await sql`
    SELECT data FROM saved_data 
    WHERE user_id = ${userId} AND name = 'business'
    LIMIT 1
  `;

  const businessData = result[0]?.data || getBusinessData;
  return { businessData };
}

export async function saveBusinessData(tenantId: string, data: BusinessData) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  await sql`
    INSERT INTO saved_data (user_id, name, data)
    VALUES (${userId}, 'business', ${JSON.stringify(data)})
    ON CONFLICT (user_id, name)
    DO UPDATE SET data = EXCLUDED.data
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
  
  if (data.businessData) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, name, data)
      VALUES (${userId}, 'business', ${JSON.stringify(data.businessData)})
      ON CONFLICT (user_id, name)
      DO UPDATE SET data = EXCLUDED.data
    `);
  }

  if (data.inventory) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, name, data)
      VALUES (${userId}, 'inventory', ${JSON.stringify(data.inventory)})
      ON CONFLICT (user_id, name)
      DO UPDATE SET data = EXCLUDED.data
    `);
  }

  if (data.customers) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, name, data)
      VALUES (${userId}, 'customers', ${JSON.stringify(data.customers)})
      ON CONFLICT (user_id, name)
      DO UPDATE SET data = EXCLUDED.data
    `);
  }

  if (data.transactions) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, name, data)
      VALUES (${userId}, 'transactions', ${JSON.stringify(data.transactions)})
      ON CONFLICT (user_id, name)
      DO UPDATE SET data = EXCLUDED.data
    `);
  }

  if (data.scenarios) {
    promises.push(sql`
      INSERT INTO saved_data (user_id, name, data)
      VALUES (${userId}, 'scenarios', ${JSON.stringify(data.scenarios)})
      ON CONFLICT (user_id, name)
      DO UPDATE SET data = EXCLUDED.data
    `);
  }

  await Promise.all(promises);
  return { success: true };
}