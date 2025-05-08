import { Pool, type PoolClient } from "pg"

// Environment variable validation
function validateEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
}

// Create a connection pool
let pool: Pool | null = null

function getPool(): Pool {
  validateEnv()

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
      max: 10, // Optimal for serverless functions
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    // Log pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
      process.exit(-1)
    })

    // Log connection events in development
    if (process.env.NODE_ENV !== "production") {
      pool.on("connect", () => console.log("Connected to PostgreSQL database"))
    }
  }

  return pool
}

// Helper function for database queries with timing and logging
export async function query(text: string, params: any[] = []) {
  const start = Date.now()
  const dbPool = getPool()

  try {
    const res = await dbPool.query(text, params)
    const duration = Date.now() - start

    // Log slow queries
    if (duration > 100) {
      console.log("Slow query:", {
        text,
        duration,
        rows: res.rowCount,
      })
    }

    return res
  } catch (error) {
    console.error("Database query error:", error)

    // Add query context to the error
    const contextError = new Error(`Query failed: ${text}`)
    contextError.cause = error
    throw contextError
  }
}

// Transaction helper
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
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

// Helper function to map database column names to camelCase
export function toCamelCase(obj: any) {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }

  return Object.keys(obj).reduce((result, key) => {
    // Convert snake_case to camelCase
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
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[snakeKey] = toSnakeCase(obj[key])
    return result
  }, {} as any)
}

// Close pool (useful for tests and scripts)
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Export pool for compatibility with existing code
export const db = {
  query: async (text: string, params: any[] = []) => {
    return getPool().query(text, params)
  },
  end: closePool,
  on: (event: string, callback: Function) => {
    getPool().on(event, callback as any)
  },
}

export { pool }
