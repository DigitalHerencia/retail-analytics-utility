"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/db";
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
    await sql`
      INSERT INTO saved_data (user_id, name, data)
      VALUES (${userId}, ${name}, ${JSON.stringify(data)})
      ON CONFLICT (user_id, name)
      DO UPDATE SET data = EXCLUDED.data;
    `;
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save data." };
  }
}

// Load data for a specific name, ensuring it belongs to the logged-in user
export async function loadData(name: string) {
  const { userId } = (await auth()) || {};
  if (!userId) throw new Error("User not authenticated");
  try {
    // Change the type annotation to expect an array of objects directly
    const result: { data: any }[] = await sql`
      SELECT data FROM saved_data WHERE user_id = ${userId} AND name = ${name};
    ` as { data: any }[];
    // Access the array directly
    if (result.length > 0) {
      // Access the first element of the array
      return { success: true, data: result[0].data };
    } else {
      return { success: false, error: "Data not found." };
    }
  } catch (error) {
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
