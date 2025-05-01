"use server"

import { put, list, del, head } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"
import { createSession, destroySession } from "@/lib/session"
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

// Define the structure for user data
interface UserData {
  username: string
  hashedPassword: string
  secretQuestionIndex: number
  hashedSecretAnswer: string
}

// Define the preset secret questions (keep consistent with the frontend)
const secretQuestions = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "In what city were you born?",
  "What is your favorite movie?",
]

const SALT_ROUNDS = 10 // Cost factor for bcrypt hashing

// Register a new user
export async function registerUser(userData: {
  username: string
  password: string
  secretQuestionIndex: number
  secretAnswer: string
}): Promise<{ success: boolean; error?: string }> {
  const { username, password, secretQuestionIndex, secretAnswer } = userData
  const blobFilename = `${username}.json`

  try {
    // 1. Check if user already exists using head (more efficient than list)
    try {
      await head(blobFilename)
      // If head succeeds, the blob exists
      return { success: false, error: "Username already exists." }
    } catch (error: any) {
      // If head throws a 404 error, the blob does not exist, which is good
      if (error.status !== 404) {
        // Re-throw unexpected errors
        throw error
      }
      // Otherwise, continue registration
    }

    // 2. Validate secret question index
    if (
      secretQuestionIndex < 0 ||
      secretQuestionIndex >= secretQuestions.length
    ) {
      return { success: false, error: "Invalid secret question selected." }
    }

    // 3. Hash password and secret answer
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const hashedSecretAnswer = await bcrypt.hash(secretAnswer, SALT_ROUNDS)

    // 4. Prepare user data object
    const newUser: UserData = {
      username,
      hashedPassword,
      secretQuestionIndex,
      hashedSecretAnswer,
    }

    // 5. Store user data in Vercel Blob
    const blob = new Blob([JSON.stringify(newUser)], {
      type: "application/json",
    })
    await put(blobFilename, blob, {
      access: "public", // Consider if 'public' is appropriate, might need restricted access later
      // Add cache control headers if needed:
      // cacheControlMaxAge: 31536000, // Example: 1 year
    })

    return { success: true }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      error: "An unexpected error occurred during registration.",
    }
  }
}

// Login user
export async function loginUser(credentials: {
  username: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  const { username, password } = credentials
  const blobFilename = `${username}.json`

  try {
    // 1. Get blob metadata to get the URL
    const blobInfo = await head(blobFilename)
    // 2. Fetch user data using the URL
    const response = await fetch(blobInfo.url)
    const userData: UserData = await response.json()

    // 2. Compare hashed password
    const passwordMatch = await bcrypt.compare(password, userData.hashedPassword)

    if (!passwordMatch) {
      return { success: false, error: "Invalid username or password." }
    }

    // 3. Login successful: set session cookie
    await createSession(username)

    return { success: true }
  } catch (error: any) {
    // Handle user not found (download throws 404)
    if (error.status === 404) {
      return { success: false, error: "Invalid username or password." }
    }
    // Handle other errors
    console.error("Error logging in user:", error)
    return {
      success: false,
      error: "An unexpected error occurred during login.",
    }
  }
}

// Logout user
export async function logoutUser(): Promise<{ success: boolean }> {
  destroySession()
  return { success: true }
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
        uploadedAt: blob.uploadedAt
          ? new Date(blob.uploadedAt).toLocaleString()
          : "N/A",
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
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`,
      )
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
    return {
      success: false,
      message: `Failed to load data: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Delete a saved data file
export async function deleteData(pathname: string) {
  try {
    if (!pathname.startsWith("business-data-")) {
        return { success: false, message: "Invalid file path for deletion." };
    }
    await del(pathname)

    revalidatePath("/")
    return { success: true, message: "Data deleted successfully" }
  } catch (error) {
    console.error("Error deleting data:", error)
    return { success: false, message: "Failed to delete data" }
  }
}
