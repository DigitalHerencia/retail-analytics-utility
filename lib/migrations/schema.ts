import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';

// Define your database tables here
export const userSecrets = pgTable('user_secrets', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  secretQuestion: varchar('secret_question', { length: 255 }).notNull(),
  secretAnswerHash: varchar('secret_answer_hash', { length: 255 }).notNull(),
});

// Tenants table
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: text('created_at'),
});

// Users table (multi-tenant, Clerk string IDs)
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Clerk string ID
  tenantId: serial('tenant_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  status: varchar('status', { length: 32 }),
});

// Customers table (multi-tenant)
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  tenantId: serial('tenant_id').notNull(),
  name: text('name'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 32 }),
  amountOwed: text('amount_owed'),
  status: varchar('status', { length: 32 }),
});

// Inventory table (multi-tenant)
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  tenantId: serial('tenant_id').notNull(),
  name: text('name'),
  quantityG: text('quantity_g'),
  price: text('price'),
});

// Transactions table (multi-tenant)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  tenantId: serial('tenant_id').notNull(),
  customerId: serial('customer_id'),
  inventoryId: serial('inventory_id'),
  type: varchar('type', { length: 32 }),
  totalPrice: text('total_price'),
  date: text('date'),
  paymentMethod: varchar('payment_method', { length: 64 }),
  notes: text('notes'),
  createdAt: text('created_at'),
});

// Scenarios table (multi-tenant, for forecasting, etc.)
export const scenarios = pgTable('scenarios', {
  id: serial('id').primaryKey(),
  tenantId: serial('tenant_id').notNull(),
  name: text('name'),
  data: text('data'),
});

// Saved data table for user-specific data (Clerk string IDs)
export const savedData = pgTable('saved_data', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Clerk string ID
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Define the schema object for drizzle
const schema = { 
  userSecrets, 
  tenants, 
  users, 
  customers, 
  inventory, 
  transactions, 
  scenarios,
  savedData  // Add savedData to schema
};

// Get the connection string from environment variables (ensure DATABASE_URL is set)
const connectionString = process.env.DATABASE_URL!;

// Create the Neon client
const client = neon(connectionString);

// Initialize drizzle with the neon client and schema
export const db = drizzle(client, { schema });

// SQL schema definitions for migration purposes
export const schemas = {
  userSecrets: `
    CREATE TABLE IF NOT EXISTS user_secrets (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      secret_question VARCHAR(255) NOT NULL,
      secret_answer_hash VARCHAR(255) NOT NULL
    );
  `,
  tenants: `
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at TEXT
    );
  `,
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id INTEGER NOT NULL,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      status VARCHAR(32)
    );
  `,
  customers: `
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL,
      name TEXT,
      email VARCHAR(255),
      phone VARCHAR(32),
      amount_owed TEXT,
      status VARCHAR(32)
    );
  `,
  inventory: `
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL,
      name TEXT,
      quantity_g TEXT,
      price TEXT
    );
  `,
  transactions: `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL,
      customer_id INTEGER,
      inventory_id INTEGER,
      type VARCHAR(32),
      total_price TEXT,
      date TEXT,
      payment_method VARCHAR(64),
      notes TEXT,
      created_at TEXT
    );
  `,
  scenarios: `
    CREATE TABLE IF NOT EXISTS scenarios (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL,
      name TEXT,
      data TEXT
    );
  `,
  savedData: `
    CREATE TABLE IF NOT EXISTS saved_data (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      key VARCHAR(255) NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_saved_data_user_id ON saved_data(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_data_user_key ON saved_data(user_id, key);
  `,
};