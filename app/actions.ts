"use server"

import { revalidatePath } from "next/cache"
import { query, withTransaction, toCamelCase, toSnakeCase } from "@/lib/db"
import type { BusinessData, ScenarioData, InventoryItem, Customer, Payment, Transaction, Account } from "@/lib/types"

// Error handling helper
function handleError(error: any, message: string): null {
  console.error(`${message}:`, error)

  // In production, you might want to log to a service like Sentry
  if (process.env.NODE_ENV === "production") {
    // Log to external service
    // Example: Sentry.captureException(error)
  }

  return null
}

// Business Data Actions
export async function getBusinessData(): Promise<BusinessData | null> {
  try {
    const result = await query(`SELECT * FROM business_data ORDER BY created_at DESC LIMIT 1`)

    if (result.rows.length === 0) {
      return null
    }

    return toCamelCase(result.rows[0])
  } catch (error) {
    return handleError(error, "Error fetching business data")
  }
}

export async function saveBusinessData(
  data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">,
): Promise<BusinessData | null> {
  try {
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO business_data 
       (wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [snakeCaseData.wholesale_price_per_oz, snakeCaseData.target_profit_per_month, snakeCaseData.operating_expenses],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    return handleError(error, "Error saving business data")
  }
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
  try {
    // Build dynamic query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    const snakeCaseData = toSnakeCase(data)

    if (snakeCaseData.wholesale_price_per_oz !== undefined) {
      updates.push(`wholesale_price_per_oz = $${paramIndex}`)
      values.push(snakeCaseData.wholesale_price_per_oz)
      paramIndex++
    }

    if (snakeCaseData.target_profit_per_month !== undefined) {
      updates.push(`target_profit_per_month = $${paramIndex}`)
      values.push(snakeCaseData.target_profit_per_month)
      paramIndex++
    }

    if (snakeCaseData.operating_expenses !== undefined) {
      updates.push(`operating_expenses = $${paramIndex}`)
      values.push(snakeCaseData.operating_expenses)
      paramIndex++
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`)

    // Add id as the last parameter
    values.push(id)

    const result = await query(
      `UPDATE business_data 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values,
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    return handleError(error, "Error updating business data")
  }
}

// Scenario Actions
export async function getScenarios(): Promise<ScenarioData[]> {
  try {
    const scenariosResult = await query(`SELECT * FROM scenarios ORDER BY created_at DESC`)

    const scenarios = toCamelCase(scenariosResult.rows)

    // For each scenario, fetch its salespeople
    for (const scenario of scenarios) {
      const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [scenario.id])

      scenario.salespeople = toCamelCase(salespeopleResult.rows)
    }

    return scenarios
  } catch (error) {
    handleError(error, "Error fetching scenarios")
    return []
  }
}

export async function getScenario(id: string): Promise<ScenarioData | null> {
  try {
    const scenarioResult = await query(`SELECT * FROM scenarios WHERE id = $1`, [id])

    if (scenarioResult.rows.length === 0) {
      return null
    }

    const scenario = toCamelCase(scenarioResult.rows[0])

    // Fetch salespeople for this scenario
    const salespeopleResult = await query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [id])

    scenario.salespeople = toCamelCase(salespeopleResult.rows)

    return scenario
  } catch (error) {
    return handleError(error, "Error fetching scenario")
  }
}

export async function createScenario(
  data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">,
): Promise<ScenarioData | null> {
  try {
    return await withTransaction(async (client) => {
      const { salespeople, ...scenarioData } = data
      const snakeCaseData = toSnakeCase(scenarioData)

      // Insert scenario
      const scenarioResult = await client.query(
        `INSERT INTO scenarios 
         (name, description, wholesale_price, retail_price, quantity, time_period, expenses)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          snakeCaseData.name,
          snakeCaseData.description,
          snakeCaseData.wholesale_price,
          snakeCaseData.retail_price,
          snakeCaseData.quantity,
          snakeCaseData.time_period,
          snakeCaseData.expenses,
        ],
      )

      const scenario = toCamelCase(scenarioResult.rows[0])

      // Insert salespeople if provided
      if (salespeople && salespeople.length > 0) {
        for (const person of salespeople) {
          const snakeCasePerson = toSnakeCase(person)
          await client.query(
            `INSERT INTO salespeople
             (scenario_id, name, commission_rate, sales_quantity)
             VALUES ($1, $2, $3, $4)`,
            [scenario.id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
          )
        }
      }

      // Fetch the complete scenario with salespeople
      const completeScenarioResult = await client.query(`SELECT * FROM scenarios WHERE id = $1`, [scenario.id])
      const completeScenario = toCamelCase(completeScenarioResult.rows[0])

      const salespeopleResult = await client.query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [scenario.id])
      completeScenario.salespeople = toCamelCase(salespeopleResult.rows)

      revalidatePath("/")
      return completeScenario
    })
  } catch (error) {
    return handleError(error, "Error creating scenario")
  }
}

export async function updateScenario(id: string, data: Partial<ScenarioData>): Promise<ScenarioData | null> {
  try {
    return await withTransaction(async (client) => {
      const { salespeople, ...scenarioData } = data
      const snakeCaseData = toSnakeCase(scenarioData)

      // Build dynamic query for scenario update
      if (Object.keys(snakeCaseData).length > 0) {
        const updates: string[] = []
        const values: any[] = []
        let paramIndex = 1

        for (const [key, value] of Object.entries(snakeCaseData)) {
          updates.push(`${key} = $${paramIndex}`)
          values.push(value)
          paramIndex++
        }

        // Add updated_at timestamp
        updates.push(`updated_at = NOW()`)

        // Add id as the last parameter
        values.push(id)

        await client.query(
          `UPDATE scenarios 
           SET ${updates.join(", ")} 
           WHERE id = $${paramIndex}`,
          values,
        )
      }

      // Update salespeople if provided
      if (salespeople) {
        // Delete existing salespeople
        await client.query(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])

        // Insert new salespeople
        for (const person of salespeople) {
          const snakeCasePerson = toSnakeCase(person)
          await client.query(
            `INSERT INTO salespeople
             (scenario_id, name, commission_rate, sales_quantity)
             VALUES ($1, $2, $3, $4)`,
            [id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
          )
        }
      }

      // Fetch the updated scenario with salespeople
      const completeScenarioResult = await client.query(`SELECT * FROM scenarios WHERE id = $1`, [id])
      const completeScenario = toCamelCase(completeScenarioResult.rows[0])

      const salespeopleResult = await client.query(`SELECT * FROM salespeople WHERE scenario_id = $1`, [id])
      completeScenario.salespeople = toCamelCase(salespeopleResult.rows)

      revalidatePath("/")
      return completeScenario
    })
  } catch (error) {
    return handleError(error, "Error updating scenario")
  }
}

export async function deleteScenario(id: string): Promise<boolean> {
  try {
    return await withTransaction(async (client) => {
      // Delete salespeople first (foreign key constraint)
      await client.query(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])

      // Delete scenario
      await client.query(`DELETE FROM scenarios WHERE id = $1`, [id])

      revalidatePath("/")
      return true
    })
  } catch (error) {
    return handleError(error, "Error deleting scenario") as any
  }
}

// Inventory Actions
export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const result = await query(`SELECT * FROM inventory_items ORDER BY created_at DESC`)

    return toCamelCase(result.rows)
  } catch (error) {
    handleError(error, "Error fetching inventory:")
    return []
  }
}

export async function createInventoryItem(
  data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): Promise<InventoryItem | null> {
  try {
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO inventory_items 
       (name, description, quantity_g, quantity_oz, quantity_kg, purchase_date, cost_per_oz, total_cost, reorder_threshold_g)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        snakeCaseData.name,
        snakeCaseData.description,
        snakeCaseData.quantity_g,
        snakeCaseData.quantity_oz,
        snakeCaseData.quantity_kg,
        snakeCaseData.purchase_date,
        snakeCaseData.cost_per_oz,
        snakeCaseData.total_cost,
        snakeCaseData.reorder_threshold_g,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    return handleError(error, "Error creating inventory item:")
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  try {
    const snakeCaseData = toSnakeCase(data)

    // Build dynamic query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`)

    // Add id as the last parameter
    values.push(id)

    const result = await query(
      `UPDATE inventory_items 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values,
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    return handleError(error, "Error updating inventory item:")
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    await query(`DELETE FROM inventory_items WHERE id = $1`, [id])

    revalidatePath("/")
    return true
  } catch (error) {
    return handleError(error, "Error deleting inventory item:") as any
  }
}

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
  try {
    const customersResult = await query(`SELECT * FROM customers ORDER BY created_at DESC`)

    const customers = toCamelCase(customersResult.rows)

    // For each customer, fetch their payments
    for (const customer of customers) {
      const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [
        customer.id,
      ])

      customer.payments = toCamelCase(paymentsResult.rows)
    }

    return customers
  } catch (error) {
    handleError(error, "Error fetching customers:")
    return []
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const customerResult = await query(`SELECT * FROM customers WHERE id = $1`, [id])

    if (customerResult.rows.length === 0) {
      return null
    }

    const customer = toCamelCase(customerResult.rows[0])

    // Fetch payments for this customer
    const paymentsResult = await query(`SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC`, [id])

    customer.payments = toCamelCase(paymentsResult.rows)

    return customer
  } catch (error) {
    return handleError(error, "Error fetching customer:")
  }
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">,
): Promise<Customer | null> {
  try {
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO customers 
       (name, phone, email, address, amount_owed, due_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        snakeCaseData.name,
        snakeCaseData.phone,
        snakeCaseData.email,
        snakeCaseData.address,
        snakeCaseData.amount_owed,
        snakeCaseData.due_date,
        snakeCaseData.status,
        snakeCaseData.notes,
      ],
    )

    const customer = toCamelCase(result.rows[0])
    customer.payments = []

    revalidatePath("/")
    return customer
  } catch (error) {
    return handleError(error, "Error creating customer:")
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  try {
    const { payments, ...customerData } = data
    const snakeCaseData = toSnakeCase(customerData)

    // Build dynamic query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`)

    // Add id as the last parameter
    values.push(id)

    await query(
      `UPDATE customers 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex}`,
      values,
    )

    // Fetch the updated customer with payments
    const result = await getCustomer(id)

    revalidatePath("/")
    return result
  } catch (error) {
    return handleError(error, "Error updating customer:")
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    return await withTransaction(async (client) => {
      // Delete payments first (foreign key constraint)
      await client.query(`DELETE FROM payments WHERE customer_id = $1`, [id])

      // Delete customer
      await client.query(`DELETE FROM customers WHERE id = $1`, [id])

      revalidatePath("/")
      return true
    })
  } catch (error) {
    return handleError(error, "Error deleting customer:") as any
  }
}

// Payment Actions
export async function addPayment(
  customerId: string,
  data: Omit<Payment, "id" | "createdAt" | "customerId">,
): Promise<Payment | null> {
  try {
    return await withTransaction(async (client) => {
      const snakeCaseData = toSnakeCase(data)

      // Insert payment
      const paymentResult = await client.query(
        `INSERT INTO payments 
         (customer_id, amount, date, method, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [customerId, snakeCaseData.amount, snakeCaseData.date, snakeCaseData.method, snakeCaseData.notes],
      )

      // Get the customer
      const customerResult = await client.query(`SELECT * FROM customers WHERE id = $1`, [customerId])

      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0]

        // Calculate new amount owed
        const newAmountOwed = Math.max(0, customer.amount_owed - snakeCaseData.amount)

        // Determine new status
        let newStatus = "unpaid"
        if (newAmountOwed === 0) {
          newStatus = "paid"
        } else if (snakeCaseData.amount > 0) {
          newStatus = "partial"
        }

        // Update customer
        await client.query(
          `UPDATE customers 
           SET amount_owed = $1, status = $2, updated_at = NOW() 
           WHERE id = $3`,
          [newAmountOwed, newStatus, customerId],
        )
      }

      revalidatePath("/")
      return toCamelCase(paymentResult.rows[0])
    })
  } catch (error) {
    return handleError(error, "Error adding payment:")
  }
}

// Transaction Actions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const result = await query(`SELECT * FROM transactions ORDER BY created_at DESC`)

    return toCamelCase(result.rows)
  } catch (error) {
    handleError(error, "Error fetching transactions:")
    return []
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
  try {
    return await withTransaction(async (client) => {
      const snakeCaseData = toSnakeCase(data)

      // Insert transaction
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, total_price, 
          cost, profit, payment_method, customer_id, customer_name, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          snakeCaseData.date,
          snakeCaseData.type,
          snakeCaseData.inventory_id,
          snakeCaseData.inventory_name,
          snakeCaseData.quantity_grams,
          snakeCaseData.price_per_gram,
          snakeCaseData.total_price,
          snakeCaseData.cost,
          snakeCaseData.profit,
          snakeCaseData.payment_method,
          snakeCaseData.customer_id,
          snakeCaseData.customer_name,
          snakeCaseData.notes,
        ],
      )

      // If it's a sale, update inventory
      if (snakeCaseData.type === "sale" && snakeCaseData.inventory_id) {
        const inventoryResult = await client.query(`SELECT * FROM inventory_items WHERE id = $1`, [
          snakeCaseData.inventory_id,
        ])

        if (inventoryResult.rows.length > 0) {
          const inventory = inventoryResult.rows[0]

          // Calculate new quantity
          const newQuantityG = Math.max(0, inventory.quantity_g - snakeCaseData.quantity_grams)
          const newQuantityOz = newQuantityG / 28.3495
          const newQuantityKg = newQuantityG / 1000
          const newTotalCost = newQuantityOz * inventory.cost_per_oz

          // Update inventory
          await client.query(
            `UPDATE inventory_items 
             SET quantity_g = $1, quantity_oz = $2, quantity_kg = $3, total_cost = $4, updated_at = NOW() 
             WHERE id = $5`,
            [newQuantityG, newQuantityOz, newQuantityKg, newTotalCost, snakeCaseData.inventory_id],
          )
        }
      }

      // If it's a credit sale, update customer
      if (snakeCaseData.type === "sale" && snakeCaseData.customer_id && snakeCaseData.payment_method === "credit") {
        const customerResult = await client.query(`SELECT * FROM customers WHERE id = $1`, [snakeCaseData.customer_id])

        if (customerResult.rows.length > 0) {
          const customer = customerResult.rows[0]

          await client.query(
            `UPDATE customers 
             SET amount_owed = $1, status = 'unpaid', updated_at = NOW() 
             WHERE id = $2`,
            [customer.amount_owed + snakeCaseData.total_price, snakeCaseData.customer_id],
          )
        }
      }

      revalidatePath("/")
      return toCamelCase(transactionResult.rows[0])
    })
  } catch (error) {
    return handleError(error, "Error creating transaction:")
  }
}

// Account Actions
export async function getAccounts(): Promise<Account[]> {
  try {
    const result = await query(`SELECT * FROM accounts ORDER BY created_at DESC`)

    return toCamelCase(result.rows)
  } catch (error) {
    handleError(error, "Error fetching accounts:")
    return []
  }
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account | null> {
  try {
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO accounts 
       (name, type, balance, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [snakeCaseData.name, snakeCaseData.type, snakeCaseData.balance, snakeCaseData.description],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    return handleError(error, "Error creating account:")
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  try {
    const snakeCaseData = toSnakeCase(data)

    // Build dynamic query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(snakeCaseData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`)

    // Add id as the last parameter
    values.push(id)

    const result = await query(
      `UPDATE accounts 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values,
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    return handleError(error, "Error updating account:")
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await query(`DELETE FROM accounts WHERE id = $1`, [id])

    revalidatePath("/")
    return true
  } catch (error) {
    return handleError(error, "Error deleting account:") as any
  }
}

// Initialize default business data if none exists
export async function initializeDefaultBusinessData(): Promise<BusinessData | null> {
  try {
    const existingDataResult = await query(`SELECT * FROM business_data LIMIT 1`)

    if (existingDataResult.rows.length === 0) {
      const result = await query(
        `INSERT INTO business_data 
         (wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [100, 2000, 500],
      )

      return toCamelCase(result.rows[0])
    }

    return toCamelCase(existingDataResult.rows[0])
  } catch (error) {
    console.error("Error initializing default business data:", error)
    return null
  }
}
