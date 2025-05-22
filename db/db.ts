import type { QueryResult } from "pg"

// Determine if we're running on the server or in the browser
const isServer = typeof window === "undefined"

// Type definitions for our database functions
type DbClient = {
  query: (text: string, params?: any[]) => Promise<any>
}

// Server-side implementation
let serverDb: {
  query: (text: string, params: any[]) => Promise<QueryResult>
  withTransaction: <T>(callback: (client: DbClient) => Promise<T>) => Promise<T>
  toCamelCase: (obj: any) => any
  toSnakeCase: (obj: any) => any
  pool: any
}

// Only import pg on the server
if (isServer) {
  const { Pool } = require("pg")

  // Environment variable validation
  function validateEnv() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
  }

  // Create a connection pool
  let pool: any = null

  function getPool() {
    validateEnv()

    if (!pool) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      })

      pool.on("error", (err: Error) => {
        console.error("Unexpected error on idle client", err)
      })
    }

    return pool
  }

  // Server-side query function
  async function serverQuery(text: string, params: any[] = []) {
    const start = Date.now()
    const dbPool = getPool()

    try {
      const res = await dbPool.query(text, params)
      const duration = Date.now() - start

      if (duration > 500) {
        console.log("Slow query:", { text, duration, rows: res.rowCount })
      }

      return res
    } catch (error) {
      console.error("Database query error:", error)
      throw error
    }
  }

  // Server-side transaction helper
  async function serverWithTransaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
    const pool = getPool()
    const client = await pool.connect()

    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  serverDb = {
    query: serverQuery,
    withTransaction: serverWithTransaction,
    toCamelCase,
    toSnakeCase,
    pool: getPool(),
  }
}

// Helper function to map database column names to camelCase
export function toCamelCase(obj: any) {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = toCamelCase(obj[key])
    return result
  }, {} as any)
}

// Helper function to map camelCase to database column names (snake_case)
export function toSnakeCase(obj: any) {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[snakeKey] = toSnakeCase(obj[key])
    return result
  }, {} as any)
}

// Browser-side query function that uses the API route
async function browserQuery(text: string, params: any[] = []): Promise<QueryResult> {
  try {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: text, params }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Database operation failed")
    }

    const { data } = await response.json()

    return {
      rows: data,
      rowCount: data.length,
      command: text.split(" ")[0].toUpperCase(),
      oid: null,
      fields: [],
    } as QueryResult
  } catch (error) {
    console.error("Browser database query error:", error)
    throw error
  }
}

// Browser-side transaction helper (simplified - all operations go through API)
async function browserWithTransaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
  // Create a mock client that uses the API route
  const mockClient = {
    query: async (text: string, params: any[] = []) => browserQuery(text, params),
  }

  return callback(mockClient)
}

// Export the appropriate implementation based on environment
export const query = isServer ? serverDb?.query : browserQuery
export const withTransaction = isServer ? serverDb?.withTransaction : browserWithTransaction
export const pool = isServer ? serverDb?.pool : null

// For compatibility with existing code
export const db = {
  query: query,
  end: async () => {
    if (isServer && serverDb?.pool) {
      await serverDb.pool.end()
    }
  },
  on: (event: string, callback: Function) => {
    if (isServer && serverDb?.pool) {
      serverDb.pool.on(event, callback as any)
    }
  },
}
