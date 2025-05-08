import { PrismaClient } from "@prisma/client"
import { ouncesToGrams } from "../lib/utils"

const prisma = new PrismaClient()

async function main() {
  // Create default business data
  const businessData = await prisma.businessData.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      wholesalePricePerOz: 100,
      targetProfitPerMonth: 2000,
      operatingExpenses: 500,
    },
  })

  console.log("Created default business data:", businessData)

  // Create sample inventory items
  const inventory1 = await prisma.inventoryItem.create({
    data: {
      name: "Premium Grade",
      description: "High quality product",
      quantityG: ouncesToGrams(5),
      quantityOz: 5,
      quantityKg: ouncesToGrams(5) / 1000,
      purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      costPerOz: 120,
      totalCost: 600,
      reorderThresholdG: 50,
    },
  })

  const inventory2 = await prisma.inventoryItem.create({
    data: {
      name: "Standard Grade",
      description: "Regular quality product",
      quantityG: ouncesToGrams(8),
      quantityOz: 8,
      quantityKg: ouncesToGrams(8) / 1000,
      purchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      costPerOz: 90,
      totalCost: 720,
      reorderThresholdG: 100,
    },
  })

  console.log("Created sample inventory items:", inventory1, inventory2)

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "John Smith",
      phone: "555-123-4567",
      email: "john@example.com",
      address: "123 Main St, Anytown",
      amountOwed: 250,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "unpaid",
      notes: "Regular client, always pays on time",
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: "Jane Doe",
      phone: "555-987-6543",
      email: "jane@example.com",
      address: "456 Oak Ave, Somewhere",
      amountOwed: 0,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "paid",
      payments: {
        create: [
          {
            amount: 500,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            method: "cash",
            notes: "Paid in full",
          },
        ],
      },
    },
  })

  console.log("Created sample customers:", customer1, customer2)

  // Create sample accounts
  const account1 = await prisma.account.create({
    data: {
      name: "Cash on Hand",
      balance: 5000,
      type: "asset",
      description: "Physical cash available",
    },
  })

  const account2 = await prisma.account.create({
    data: {
      name: "Bank Account",
      balance: 12000,
      type: "asset",
      description: "Main business bank account",
    },
  })

  console.log("Created sample accounts:", account1, account2)

  // Create sample scenarios
  const scenario1 = await prisma.scenario.create({
    data: {
      name: "Low Markup",
      markupPercentage: 50,
      retailPricePerGram: 5.3,
      profitPerGram: 1.77,
      breakEvenGramsPerMonth: 1412.43,
      breakEvenOuncesPerMonth: 49.82,
      monthlyRevenue: 7500,
      monthlyCost: 5000,
      monthlyProfit: 2500,
      roi: 50,
      netProfit: 2000,
      netProfitAfterCommission: 1800,
      totalCommission: 200,
      salespeople: {
        create: [
          {
            name: "Alice",
            commissionRate: 5,
            salesTarget: 2500,
            actualSales: 2000,
            earnings: 100,
          },
          {
            name: "Bob",
            commissionRate: 5,
            salesTarget: 2500,
            actualSales: 2000,
            earnings: 100,
          },
        ],
      },
    },
  })

  const scenario2 = await prisma.scenario.create({
    data: {
      name: "Medium Markup",
      markupPercentage: 100,
      retailPricePerGram: 7.06,
      profitPerGram: 3.53,
      breakEvenGramsPerMonth: 706.21,
      breakEvenOuncesPerMonth: 24.91,
      monthlyRevenue: 10000,
      monthlyCost: 5000,
      monthlyProfit: 5000,
      roi: 100,
      netProfit: 4500,
      netProfitAfterCommission: 4050,
      totalCommission: 450,
      salespeople: {
        create: [
          {
            name: "Charlie",
            commissionRate: 5,
            salesTarget: 5000,
            actualSales: 4500,
            earnings: 225,
          },
          {
            name: "Diana",
            commissionRate: 5,
            salesTarget: 5000,
            actualSales: 4500,
            earnings: 225,
          },
        ],
      },
    },
  })

  console.log("Created sample scenarios:", scenario1, scenario2)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
