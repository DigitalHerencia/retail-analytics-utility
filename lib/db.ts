// lib/db.ts

import { Pool } from "@neondatabase/serverless";

// Only run DB code on the server
const isServer = typeof window === "undefined";

type DbClient = {
  query: (text: string, params?: any[]) => Promise<any>;
};

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return url;
}

let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool;
    poolInstance.on("error", (err: Error) => {
      console.error("Unexpected error on idle DB client", err);
    });
  }
  return poolInstance;
}

async function serverQuery(text: string, params: any[] = []) {
  const start = Date.now();
  const dbPool = getPool();
  try {
    const res = await dbPool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 500) {
      console.warn("Slow query:", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

async function serverWithTransaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Case converters
export function toCamelCase(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
    return result;
  }, {} as any);
}

export function toSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
    return result;
  }, {} as any);
}

// Exported API
export const query = isServer
  ? serverQuery
  : async () => {
      throw new Error("Database not available on the client");
    };

export const withTransaction = isServer
  ? serverWithTransaction
  : async () => {
      throw new Error("Database not available on the client");
    };

export const pool = isServer ? getPool() : null;
