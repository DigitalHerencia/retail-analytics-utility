import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';
// Note: The 'sql' import from 'drizzle-orm' is for building SQL queries, not for connection.
// Remove it if not used elsewhere, or keep it if needed for query building.
// import { sql } from 'drizzle-orm';

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

// Users table (for authentication, linked to tenant)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  tenantId: serial('tenant_id').notNull(),
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

// Define the schema object for drizzle
const schema = { userSecrets, tenants, users, customers, inventory, transactions, scenarios };

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
      id SERIAL PRIMARY KEY,
      clerk_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL,
      username VARCHAR(255),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      tenant_id INTEGER NOT NULL
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
  `
};