"use server"

import { query, withTransaction, toCamelCase, toSnakeCase } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import type { BusinessData, InventoryItem, Customer, Transaction, Account, Payment, PricePoint } from "@/lib/data"
import { defaultMarkupPercentages } from "@/lib/data"
import { revalidatePath } from "next/cache"

// Business Data Actions
export async function getBusinessData(): Promise<BusinessData> {
  try {
    const result = await query("SELECT * FROM business_data LIMIT 1")

    if (result.rows.length === 0) {
      // If no business data exists, initialize with defaults
      return initializeDefaultBusinessData()
    }

    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error getting business data:", error)
    throw new Error("Failed to get business data")
  }
}

export async function saveBusinessData(
  data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">,
): Promise<BusinessData | null> {
  try {
    const snakeCaseData = toSnakeCase(data)
    const result = await query(
      `INSERT INTO business_data 
       (id, wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        uuidv4(),
        snakeCaseData.wholesale_price_per_oz,
        snakeCaseData.target_profit_per_month,
        snakeCaseData.operating_expenses,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error saving business data:", error)
    return null
  }
}

export async function initializeDefaultBusinessData(): Promise<BusinessData> {
  try {
    // Check if business data already exists
    const existingData = await query("SELECT * FROM business_data LIMIT 1")

    if (existingData.rows.length > 0) {
      return toCamelCase(existingData.rows[0])
    }

    // Insert default business data
    const result = await query(
      `INSERT INTO business_data 
       (id, wholesale_price_per_oz, target_profit_per_month, operating_expenses) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        uuidv4(),
        100, // Default wholesale price per oz
        2000, // Default target profit per month
        500, // Default operating expenses
      ],
    )

    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error initializing business data:", error)
    throw new Error("Failed to initialize business data")
  }
}

export async function updateBusinessData(data: Partial<BusinessData>): Promise<BusinessData> {
  try {
    const existingData = await getBusinessData()

    const result = await query(
      `UPDATE business_data 
       SET wholesale_price_per_oz = $1, 
           target_profit_per_month = $2, 
           operating_expenses = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        data.wholesalePricePerOz ?? existingData.wholesalePricePerOz,
        data.targetProfitPerMonth ?? existingData.targetProfitPerMonth,
        data.operatingExpenses ?? existingData.operatingExpenses,
        existingData.id,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error updating business data:", error)
    throw new Error("Failed to update business data")
  }
}

// Scenario Actions
export async function getScenarios(): Promise<any[]> {
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
    console.error("Error fetching scenarios:", error)
    return []
  }
}

export async function getScenario(id: string): Promise<any | null> {
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
    console.error("Error fetching scenario:", error)
    return null
  }
}

export async function createScenario(data: any): Promise<any | null> {
  try {
    const { salespeople, ...scenarioData } = data
    const snakeCaseData = toSnakeCase(scenarioData)

    // Begin transaction
    await query("BEGIN")

    // Insert scenario
    const scenarioResult = await query(
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
        await query(
          `INSERT INTO salespeople
           (scenario_id, name, commission_rate, sales_quantity)
           VALUES ($1, $2, $3, $4)`,
          [scenario.id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
        )
      }
    }

    // Commit transaction
    await query("COMMIT")

    // Fetch the complete scenario with salespeople
    const result = await getScenario(scenario.id)

    revalidatePath("/")
    return result
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error creating scenario:", error)
    return null
  }
}

export async function updateScenario(id: string, data: Partial<any>): Promise<any | null> {
  try {
    const { salespeople, ...scenarioData } = data
    const snakeCaseData = toSnakeCase(scenarioData)

    // Begin transaction
    await query("BEGIN")

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

      await query(
        `UPDATE scenarios 
         SET ${updates.join(", ")} 
         WHERE id = $${paramIndex}`,
        values,
      )
    }

    // Update salespeople if provided
    if (salespeople) {
      // Delete existing salespeople
      await query(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])

      // Insert new salespeople
      for (const person of salespeople) {
        const snakeCasePerson = toSnakeCase(person)
        await query(
          `INSERT INTO salespeople
           (scenario_id, name, commission_rate, sales_quantity)
           VALUES ($1, $2, $3, $4)`,
          [id, snakeCasePerson.name, snakeCasePerson.commission_rate, snakeCasePerson.sales_quantity],
        )
      }
    }

    // Commit transaction
    await query("COMMIT")

    // Fetch the updated scenario with salespeople
    const result = await getScenario(id)

    revalidatePath("/")
    return result
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error updating scenario:", error)
    return null
  }
}

export async function deleteScenario(id: string): Promise<boolean> {
  try {
    // Begin transaction
    await query("BEGIN")

    // Delete salespeople first (foreign key constraint)
    await query(`DELETE FROM salespeople WHERE scenario_id = $1`, [id])

    // Delete scenario
    await query(`DELETE FROM scenarios WHERE id = $1`, [id])

    // Commit transaction
    await query("COMMIT")

    revalidatePath("/")
    return true
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK")
    console.error("Error deleting scenario:", error)
    return false
  }
}

// Inventory Actions
export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const result = await query("SELECT * FROM inventory ORDER BY name")
    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error getting inventory:", error)
    throw new Error("Failed to get inventory")
  }
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  try {
    const result = await query("SELECT * FROM inventory WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return null
    }

    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error getting inventory item:", error)
    throw new Error("Failed to get inventory item")
  }
}

export async function createInventoryItem(
  item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): Promise<InventoryItem> {
  try {
    const result = await query(
      `INSERT INTO inventory 
       (id, name, description, quantity_g, quantity_oz, quantity_kg, purchase_date, cost_per_oz, total_cost, reorder_threshold_g) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        uuidv4(),
        item.name,
        item.description,
        item.quantityG,
        item.quantityOz,
        item.quantityKg,
        item.purchaseDate,
        item.costPerOz,
        item.totalCost,
        item.reorderThresholdG,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error creating inventory item:", error)
    throw new Error("Failed to create inventory item")
  }
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  try {
    const existingItem = await getInventoryItem(id)

    if (!existingItem) {
      throw new Error("Inventory item not found")
    }

    const result = await query(
      `UPDATE inventory 
       SET name = $1, 
           description = $2, 
           quantity_g = $3, 
           quantity_oz = $4, 
           quantity_kg = $5, 
           purchase_date = $6, 
           cost_per_oz = $7, 
           total_cost = $8, 
           reorder_threshold_g = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        item.name ?? existingItem.name,
        item.description ?? existingItem.description,
        item.quantityG ?? existingItem.quantityG,
        item.quantityOz ?? existingItem.quantityOz,
        item.quantityKg ?? existingItem.quantityKg,
        item.purchaseDate ?? existingItem.purchaseDate,
        item.costPerOz ?? existingItem.costPerOz,
        item.totalCost ?? existingItem.totalCost,
        item.reorderThresholdG ?? existingItem.reorderThresholdG,
        id,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error updating inventory item:", error)
    throw new Error("Failed to update inventory item")
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    const result = await query("DELETE FROM inventory WHERE id = $1 RETURNING id", [id])
    revalidatePath("/")
    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    throw new Error("Failed to delete inventory item")
  }
}

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
  try {
    const result = await query("SELECT * FROM customers ORDER BY name")
    const customers = toCamelCase(result.rows)

    // Get payment history for each customer
    for (const customer of customers) {
      const paymentsResult = await query("SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC", [
        customer.id,
      ])
      customer.paymentHistory = toCamelCase(paymentsResult.rows)
    }

    return customers
  } catch (error) {
    console.error("Error getting customers:", error)
    throw new Error("Failed to get customers")
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const result = await query("SELECT * FROM customers WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return null
    }

    const customer = toCamelCase(result.rows[0])

    // Get payment history
    const paymentsResult = await query("SELECT * FROM payments WHERE customer_id = $1 ORDER BY date DESC", [id])
    customer.paymentHistory = toCamelCase(paymentsResult.rows)

    return customer
  } catch (error) {
    console.error("Error getting customer:", error)
    throw new Error("Failed to get customer")
  }
}

export async function createCustomer(
  customer: Omit<Customer, "id" | "createdAt" | "updatedAt" | "paymentHistory">,
): Promise<Customer> {
  try {
    const result = await query(
      `INSERT INTO customers 
       (id, name, phone, email, address, amount_owed, due_date, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        uuidv4(),
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
        customer.amountOwed,
        customer.dueDate,
        customer.status,
        customer.notes,
      ],
    )

    const newCustomer = toCamelCase(result.rows[0])
    newCustomer.paymentHistory = []

    revalidatePath("/")
    return newCustomer
  } catch (error) {
    console.error("Error creating customer:", error)
    throw new Error("Failed to create customer")
  }
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  try {
    const existingCustomer = await getCustomer(id)

    if (!existingCustomer) {
      throw new Error("Customer not found")
    }

    const result = await query(
      `UPDATE customers 
       SET name = $1, 
           phone = $2, 
           email = $3, 
           address = $4, 
           amount_owed = $5, 
           due_date = $6, 
           status = $7, 
           notes = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        customer.name ?? existingCustomer.name,
        customer.phone ?? existingCustomer.phone,
        customer.email ?? existingCustomer.email,
        customer.address ?? existingCustomer.address,
        customer.amountOwed ?? existingCustomer.amountOwed,
        customer.dueDate ?? existingCustomer.dueDate,
        customer.status ?? existingCustomer.status,
        customer.notes ?? existingCustomer.notes,
        id,
      ],
    )

    const updatedCustomer = toCamelCase(result.rows[0])
    updatedCustomer.paymentHistory = existingCustomer.paymentHistory

    revalidatePath("/")
    return updatedCustomer
  } catch (error) {
    console.error("Error updating customer:", error)
    throw new Error("Failed to update customer")
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    // Delete associated payments first
    await query("DELETE FROM payments WHERE customer_id = $1", [id])

    // Then delete the customer
    const result = await query("DELETE FROM customers WHERE id = $1 RETURNING id", [id])
    revalidatePath("/")
    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw new Error("Failed to delete customer")
  }
}

// Payment Actions
export async function addPayment(customerId: string, payment: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
  return await withTransaction(async (client) => {
    try {
      // Add payment record
      const paymentResult = await client.query(
        `INSERT INTO payments 
         (id, customer_id, amount, date, method, notes) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [uuidv4(), customerId, payment.amount, payment.date, payment.method, payment.notes],
      )

      // Update customer's amount owed
      const customerResult = await client.query("SELECT * FROM customers WHERE id = $1", [customerId])

      if (customerResult.rows.length === 0) {
        throw new Error("Customer not found")
      }

      const customer = toCamelCase(customerResult.rows[0])
      const newAmountOwed = Math.max(0, customer.amountOwed - payment.amount)
      const newStatus = newAmountOwed === 0 ? "paid" : newAmountOwed < customer.amountOwed ? "partial" : "unpaid"

      await client.query(
        `UPDATE customers 
         SET amount_owed = $1, 
             status = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [newAmountOwed, newStatus, customerId],
      )

      revalidatePath("/")
      return toCamelCase(paymentResult.rows[0])
    } catch (error) {
      console.error("Error adding payment:", error)
      throw new Error("Failed to add payment")
    }
  })
}

// Transaction Actions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const result = await query("SELECT * FROM transactions ORDER BY date DESC")
    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error getting transactions:", error)
    throw new Error("Failed to get transactions")
  }
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  try {
    const result = await query("SELECT * FROM transactions WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return null
    }

    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error getting transaction:", error)
    throw new Error("Failed to get transaction")
  }
}

export async function createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
  return await withTransaction(async (client) => {
    try {
      // Create transaction record
      const result = await client.query(
        `INSERT INTO transactions 
         (id, date, type, inventory_id, inventory_name, quantity_grams, price_per_gram, 
          total_price, cost, profit, payment_method, customer_id, customer_name, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [
          uuidv4(),
          transaction.date,
          transaction.type,
          transaction.inventoryId,
          transaction.inventoryName,
          transaction.quantityGrams,
          transaction.pricePerGram,
          transaction.totalPrice,
          transaction.cost,
          transaction.profit,
          transaction.paymentMethod,
          transaction.customerId,
          transaction.customerName,
          transaction.notes,
        ],
      )

      // If this is a sale, update inventory
      if (transaction.type === "sale" && transaction.inventoryId) {
        const inventoryResult = await client.query("SELECT * FROM inventory WHERE id = $1", [transaction.inventoryId])

        if (inventoryResult.rows.length > 0) {
          const inventory = toCamelCase(inventoryResult.rows[0])
          const newQuantityG = Math.max(0, inventory.quantityG - transaction.quantityGrams)
          const newQuantityOz = newQuantityG / 28.35
          const newQuantityKg = newQuantityG / 1000

          await client.query(
            `UPDATE inventory 
             SET quantity_g = $1, 
                 quantity_oz = $2, 
                 quantity_kg = $3,
                 updated_at = NOW()
             WHERE id = $4`,
            [newQuantityG, newQuantityOz, newQuantityKg, transaction.inventoryId],
          )
        }
      }

      // If this is a credit sale, update customer's amount owed
      if (transaction.type === "sale" && transaction.paymentMethod === "credit" && transaction.customerId) {
        const customerResult = await client.query("SELECT * FROM customers WHERE id = $1", [transaction.customerId])

        if (customerResult.rows.length > 0) {
          const customer = toCamelCase(customerResult.rows[0])
          const newAmountOwed = customer.amountOwed + transaction.totalPrice

          await client.query(
            `UPDATE customers 
             SET amount_owed = $1, 
                 status = 'unpaid',
                 updated_at = NOW()
             WHERE id = $2`,
            [newAmountOwed, transaction.customerId],
          )
        }
      }

      revalidatePath("/")
      return toCamelCase(result.rows[0])
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw new Error("Failed to create transaction")
    }
  })
}

// Account Actions
export async function getAccounts(): Promise<Account[]> {
  try {
    const result = await query("SELECT * FROM accounts ORDER BY name")
    return toCamelCase(result.rows)
  } catch (error) {
    console.error("Error getting accounts:", error)
    throw new Error("Failed to get accounts")
  }
}

export async function getAccount(id: string): Promise<Account | null> {
  try {
    const result = await query("SELECT * FROM accounts WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return null
    }

    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error getting account:", error)
    throw new Error("Failed to get account")
  }
}

export async function createAccount(account: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account> {
  try {
    const result = await query(
      `INSERT INTO accounts 
       (id, name, type, balance, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [uuidv4(), account.name, account.type, account.balance, account.description],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error creating account:", error)
    throw new Error("Failed to create account")
  }
}

export async function updateAccount(id: string, account: Partial<Account>): Promise<Account> {
  try {
    const existingAccount = await getAccount(id)

    if (!existingAccount) {
      throw new Error("Account not found")
    }

    const result = await query(
      `UPDATE accounts 
       SET name = $1, 
           type = $2, 
           balance = $3, 
           description = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        account.name ?? existingAccount.name,
        account.type ?? existingAccount.type,
        account.balance ?? existingAccount.balance,
        account.description ?? existingAccount.description,
        id,
      ],
    )

    revalidatePath("/")
    return toCamelCase(result.rows[0])
  } catch (error) {
    console.error("Error updating account:", error)
    throw new Error("Failed to update account")
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await query("DELETE FROM accounts WHERE id = $1 RETURNING id", [id])
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting account:", error)
    throw new Error("Failed to delete account")
  }
}

// Price Calculation
export async function calculatePricePoints(): Promise<PricePoint[]> {
  try {
    const businessData = await getBusinessData()

    const wholesalePricePerOz = businessData.wholesalePricePerOz
    const targetProfitPerMonth = businessData.targetProfitPerMonth
    const operatingExpenses = businessData.operatingExpenses

    const wholesalePricePerGram = wholesalePricePerOz / 28.35

    const pricePoints = defaultMarkupPercentages.map((markupPercentage) => {
      // Calculate retail price based on markup
      const retailPricePerGram = wholesalePricePerGram * (1 + markupPercentage / 100)

      // Calculate profit per gram
      const profitPerGram = retailPricePerGram - wholesalePricePerGram

      // Calculate break-even quantity (including operating expenses)
      const totalMonthlyExpenses = operatingExpenses + targetProfitPerMonth
      const breakEvenGramsPerMonth = profitPerGram > 0 ? totalMonthlyExpenses / profitPerGram : 0
      const breakEvenOuncesPerMonth = breakEvenGramsPerMonth / 28.35

      // Calculate monthly financials
      const monthlyRevenue = retailPricePerGram * breakEvenGramsPerMonth
      const monthlyCost = wholesalePricePerGram * breakEvenGramsPerMonth
      const monthlyProfit = monthlyRevenue - monthlyCost - operatingExpenses

      // Calculate ROI
      const totalInvestment = monthlyCost + operatingExpenses
      const roi = totalInvestment > 0 ? (monthlyProfit / totalInvestment) * 100 : 0

      return {
        id: uuidv4(),
        markupPercentage,
        retailPricePerGram,
        profitPerGram,
        breakEvenGramsPerMonth,
        breakEvenOuncesPerMonth,
        monthlyRevenue,
        monthlyCost,
        monthlyProfit,
        roi,
      }
    })

    return pricePoints
  } catch (error) {
    console.error("Error calculating price points:", error)
    throw new Error("Failed to calculate price points")
  }
}
