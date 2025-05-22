"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/db/db";
import bcrypt from 'bcryptjs';

// Save user secret question and hashed answer
type SaveUserSecretParams = {
  username: string
  secretQuestion: string
  secretAnswer: string
}
export async function saveUserSecret({ username, secretQuestion, secretAnswer }: SaveUserSecretParams) {
  const hash = await bcrypt.hash(secretAnswer, 10)
  await sql`INSERT INTO user_secrets (username, secret_question, secret_answer_hash) VALUES (${username}, ${secretQuestion}, ${hash}) ON CONFLICT (username) DO UPDATE SET secret_question = EXCLUDED.secret_question, secret_answer_hash = EXCLUDED.secret_answer_hash`
}

// Fetch secret question by username
export async function getSecretQuestion(username: string): Promise<string | null> {
  const result = await sql`SELECT secret_question FROM user_secrets WHERE username = ${username}`
  return result[0]?.secret_question || null
}

// Verify secret answer
export async function verifySecretAnswer(username: string, answer: string): Promise<boolean> {
  const result = await sql`SELECT secret_answer_hash FROM user_secrets WHERE username = ${username}`
  if (!result[0]) return false
  return await bcrypt.compare(answer, result[0].secret_answer_hash)
}

export async function saveData(name: string, data: any) {
  const { userId } = (await auth()) || {};
  if (!userId) throw new Error("User not authenticated");
  try {
    const now = new Date().toISOString();
    await sql`
      INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
      VALUES (${userId}, ${name}, ${JSON.stringify(data)}, ${now}, ${now})
      ON CONFLICT (user_id, key)
      DO UPDATE SET value = ${JSON.stringify(data)}, updated_at = ${now}
    `;
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to save data:", error);
    return { success: false, error: "Failed to save data." };
  }
}

// Load data for a specific name, ensuring it belongs to the logged-in user
export async function loadData(name: string) {
  const { userId } = (await auth()) || {};
  if (!userId) throw new Error("User not authenticated");
  try {
    const result = await sql`
      SELECT value, key FROM saved_data 
      WHERE user_id = ${userId} AND key = ${name}
      LIMIT 1;
    `;
    
    if (result.length > 0) {
      return { success: true, data: JSON.parse(result[0].value) };
    } else {
      return { success: false, error: "Data not found." };
    }
  } catch (error) {
    console.error("Failed to load data:", error);
    return { success: false, error: "Failed to load data." };
  }
}

// Get list of saved data files for the logged-in user
export async function getSavedDataList() {
  const { userId } = (await auth()) || {};
  if (!userId) throw new Error("User not authenticated");
  try {
    const result = await sql`
      SELECT name FROM saved_data WHERE user_id = ${userId};
    `;
    return { success: true, list: result.map((row) => row.name) };
  } catch (error) {
    return { success: false, error: "Failed to get saved data list." };
  }
}

// Delete a saved data entry by name, ensuring it belongs to the logged-in user
export async function deleteData(name: string) {
  const { userId } = (await auth()) || {};
  if (!userId) throw new Error("User not authenticated");
  try {
    await sql`
      DELETE FROM saved_data WHERE user_id = ${userId} AND name = ${name};
    `;
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete data." };
  }
}

// Specific type-safe data saving functions
export async function saveBusinessData(businessData: any) {
  return saveData("business", businessData);
}

export async function saveInventory(inventory: any) {
  return saveData("inventory", inventory);
}

export async function saveCustomers(customers: any) {
  return saveData("customers", customers);
}

export async function saveTransactions(transactions: any) {
  return saveData("transactions", transactions);
}

export async function saveScenarios(scenarios: any) {
  return saveData("scenarios", scenarios);
}

// Auto-save utility that combines multiple save operations
export async function saveAllData({ businessData, inventory, customers, transactions, scenarios }: {
  businessData?: any;
  inventory?: any;
  customers?: any;
  transactions?: any;
  scenarios?: any;
}) {
  const promises = [];
  if (businessData) promises.push(saveBusinessData(businessData));
  if (inventory) promises.push(saveInventory(inventory));
  if (customers) promises.push(saveCustomers(customers));
  if (transactions) promises.push(saveTransactions(transactions));
  if (scenarios) promises.push(saveScenarios(scenarios));
  
  const results = await Promise.allSettled(promises);
  const failedOperations = results.filter(result => result.status === 'rejected' || 
    (result.status === 'fulfilled' && !result.value.success));
  
  return {
    success: failedOperations.length === 0,
    error: failedOperations.length > 0 ? "Some data could not be saved" : undefined
  };
}

// Load all data at once for efficiency
export async function loadAllData() {
  const { userId } = (await auth()) || {};
  if (!userId) throw new Error("User not authenticated");
  
  try {
    const promises = [
      loadData("business"),
      loadData("inventory"),
      loadData("customers"),
      loadData("transactions"),
      loadData("scenarios")
    ];
    
    const [businessResult, inventoryResult, customersResult, transactionsResult, scenariosResult] = 
      await Promise.all(promises);
    
    return {
      success: true,
      businessData: businessResult.success ? businessResult.data : null,
      inventory: inventoryResult.success ? inventoryResult.data : [],
      customers: customersResult.success ? customersResult.data : [],
      transactions: transactionsResult.success ? transactionsResult.data : [],
      scenarios: scenariosResult.success ? scenariosResult.data : []
    };
  } catch (error) {
    console.error("Error loading all data:", error);
    return { success: false, error: "Failed to load data." };
  }
}
