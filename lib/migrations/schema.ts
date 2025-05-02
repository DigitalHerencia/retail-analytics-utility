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

// Define additional tables as your application grows
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  // Add other customer columns here, e.g., name, email
  name: text('name'), // Example column
});
// export const inventory = pgTable('inventory', {...})
// export const transactions = pgTable('transactions', {...})

// Define the schema object for drizzle
const schema = { userSecrets, customers };

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
  customers: `
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT
    );
  `
  // Add more schemas as needed
};