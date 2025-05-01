"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import sql from "@/lib/db";

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
