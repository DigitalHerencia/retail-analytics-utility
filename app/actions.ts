"use server"

import { put, list, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { BusinessData, InventoryItem, Customer } from "@/lib/data"

// Define the structure of our saved data
interface SavedData {
  id: string
  name: string
  timestamp: number
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
}

// Save data to Vercel Blob
export async function saveData(
  name: string,
  businessData: BusinessData,
  inventory: InventoryItem[],
  customers: Customer[],
) {
  try {
    const savedData: SavedData = {
      id: uuidv4(),
      name,
      timestamp: Date.now(),
      businessData,
      inventory,
      customers,
    }

    const filename = `business-data-${savedData.id}.json`
    const blob = new Blob([JSON.stringify(savedData)], { type: "application/json" })

    const { url } = await put(filename, blob, { access: "public" })

    revalidatePath("/")
    return { success: true, message: "Data saved successfully", url }
  } catch (error) {
    console.error("Error saving data:", error)
    return { success: false, message: "Failed to save data" }
  }
}

// Get list of saved data files
export async function getSavedDataList() {
  try {
    const { blobs } = await list({ prefix: "business-data-" })

    return {
      success: true,
      files: blobs.map((blob) => ({
        id: blob.pathname.replace("business-data-", "").replace(".json", ""),
        url: blob.url,
        pathname: blob.pathname,
        uploadedAt: new Date(blob.uploadedAt).toLocaleString(),
      })),
    }
  } catch (error) {
    console.error("Error listing saved data:", error)
    return { success: false, files: [] }
  }
}

// Load data from a specific URL
export async function loadData(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Failed to fetch data")
    }

    const savedData: SavedData = await response.json()

    revalidatePath("/")
    return {
      success: true,
      message: "Data loaded successfully",
      data: savedData,
    }
  } catch (error) {
    console.error("Error loading data:", error)
    return { success: false, message: "Failed to load data" }
  }
}

// Delete a saved data file
export async function deleteData(pathname: string) {
  try {
    await del(pathname)

    revalidatePath("/")
    return { success: true, message: "Data deleted successfully" }
  } catch (error) {
    console.error("Error deleting data:", error)
    return { success: false, message: "Failed to delete data" }
  }
}
