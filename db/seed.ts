import { query, withTransaction, closePool } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

async function seed() {
  console.log("Starting database seeding...")

  try {
    // Check if data already exists
    const businessDataResult = await query(`SELECT COUNT(*) FROM business_data`)

    if (Number.parseInt(businessDataResult.rows[0].count) > 0) {
      console.log("Database already contains data. Skipping seed.")
      return
    }

    await withTransaction(async (client) => {
      // Seed business_data
      await client.query(
        `
        INSERT INTO business_data 
        (id, wholesale_price_per_oz, target_profit_per_month, operating_expenses)
        VALUES ($1, $2, $3, $4)
      `,
        [uuidv4(), 100.0, 2000.0, 500.0],
      )

      // Seed scenarios
      const scenario1Id = uuidv4()
      const scenario2Id = uuidv4()

      await client.query(
        `
        INSERT INTO scenarios 
        (id, name, description, wholesale_price, retail_price, quantity, time_period, expenses)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8),
        ($9, $10, $11, $12, $13, $14, $15, $16)
      `,
        [
          scenario1Id,
          "Standard Pricing",
          "Regular pricing model with 100% markup",
          100.0,
          200.0,
          20.0,
          "month",
          500.0,
          scenario2Id,
          "Premium Pricing",
          "Higher-end pricing with 150% markup",
          100.0,
          250.0,
          15.0,
          "month",
          500.0,
        ],
      )

      // Seed salespeople
      await client.query(
        `
        INSERT INTO salespeople 
        (id, scenario_id, name, commission_rate, sales_quantity)
        VALUES 
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
      `,
        [uuidv4(), scenario1Id, "John Smith", 10.0, 10.0, uuidv4(), scenario2Id, "Jane Doe", 15.0, 8.0],
      )

      // Seed inventory_items
      const inventory1Id = uuidv4()
      const inventory2Id = uuidv4()

      await client.query(
        `
        INSERT INTO inventory_items 
        (id, name, description, quantity_g, quantity_oz, quantity_kg, purchase_date, cost_per_oz, total_cost, reorder_threshold_g)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      `,
        [
          inventory1Id,
          "Premium",
          "Top shelf product",
          100.0,
          3.53,
          0.1,
          "2024-01-01",
          80.0,
          282.4,
          20.0,
          inventory2Id,
          "Standard",
          "Mid-grade product",
          200.0,
          7.05,
          0.2,
          "2024-01-05",
          50.0,
          352.5,
          50.0,
        ],
      )

      // Seed customers
      const customer1Id = uuidv4()
      const customer2Id = uuidv4()

      await client.query(
        `
        INSERT INTO customers 
        (id, name, phone, email, address, amount_owed, due_date, status, notes)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9),
        ($10, $11, $12, $13, $14, $15, $16, $17, $18)
      `,
        [
          customer1Id,
          "John Doe",
          "555-123-4567",
          "john.doe@example.com",
          "123 Main St",
          100.0,
          "2024-02-15",
          "unpaid",
          "Regular customer",
          customer2Id,
          "Jane Smith",
          "555-987-6543",
          "jane.smith@example.com",
          "456 Elm St",
          0.0,
          "2024-02-20",
          "paid",
          "New customer",
        ],
      )

      // Seed payments
      await client.query(
        `
        INSERT INTO payments 
        (id, customer_id, amount, date, method, notes)
        VALUES
        ($1, $2, $3, $4, $5, $6)
      `,
        [uuidv4(), customer2Id, 150.0, "2024-01-15", "cash", "Full payment"],
      )

      // Seed transactions
      await client.query(
        `
        INSERT INTO transactions 
        (id, date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price, cost, profit, payment_method, customer_id, customer_name, notes)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `,
        [
          uuidv4(),
          new Date(),
          "sale",
          inventory1Id,
          "Premium",
          3.5,
          20.0,
          70.0,
          35.0,
          35.0,
          "cash",
          customer1Id,
          "John Doe",
          "Regular purchase",
        ],
      )

      // Seed accounts
      await client.query(
        `
        INSERT INTO accounts 
        (id, name, type, balance, description)
        VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15)
      `,
        [
          uuidv4(),
          "Cash on Hand",
          "asset",
          1500.0,
          "Physical cash available",
          uuidv4(),
          "Bank Account",
          "asset",
          3500.0,
          "Business checking account",
          uuidv4(),
          "Accounts Receivable",
          "asset",
          100.0,
          "Money owed by customers",
        ],
      )
    })

    console.log("Database seeding completed successfully")
  } catch (error) {
    console.error("Seeding failed:", error)
    throw error
  } finally {
    // Close the pool
    await closePool()
  }
}

// Run the seed if this file is executed directly
if (typeof require !== "undefined" && require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default seed
