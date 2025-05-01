import { v4 as uuidv4 } from "uuid";
import type { Customer, Payment, InventoryItem, Transaction } from "./data";

// Generate a random date within the last month (or more)
const getRandomRecentDate = (daysBack = 180) => {
  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - daysBack);

  const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
  return new Date(randomTime).toISOString().split("T")[0];
};

// Generate a random amount between min and max
const getRandomAmount = (min: number, max: number) => {
  return +(min + Math.random() * (max - min)).toFixed(2);
};

// Generate demo customers with realistic data
export const generateDemoCustomers = (): Customer[] => {
  const customerNames = [
    "Mike Johnson", "Sarah Williams", "Dave Smith", "Lisa Brown", "Chris Davis",
    "Jessica Wilson", "Tony Martinez", "Rachel Taylor", "Kevin Anderson", "Amanda Thomas",
    "Eric Garcia", "Nicole Lewis", "Big Spender", "Regular Ray", "Occasional Olivia"
  ];

  return customerNames.map((name, index) => {
    const paymentHistory: Payment[] = [];
    let amountOwed = 0;
    const createdAt = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(); // Wider date range
    let updatedAt = createdAt;

    const numPurchases = Math.floor(Math.random() * 15) + 1; // More potential purchases
    let lastPurchaseDate = new Date(Date.parse(createdAt));

    for (let i = 0; i < numPurchases; i++) {
      // Vary purchase amounts more
      const purchaseAmount = name === "Big Spender" ? getRandomAmount(500, 2000) : getRandomAmount(20, 500);
      const purchaseDate = new Date(lastPurchaseDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000); // Shorter time between purchases sometimes
      if (purchaseDate.getTime() > Date.now()) continue; // Don't create future dates
      lastPurchaseDate = purchaseDate;
      updatedAt = purchaseDate.toISOString();

      const paid = Math.random() > 0.4; // Slightly higher chance of owing money
      if (paid) {
        paymentHistory.push({
          id: uuidv4(),
          date: purchaseDate.toISOString().split("T")[0],
          amount: purchaseAmount,
          method: ["cash", "bank_transfer", "crypto", "credit"][Math.floor(Math.random() * 4)] as "cash" | "bank_transfer" | "crypto" | "credit",
          notes: `Payment for purchase #${i + 1}`,
          createdAt: purchaseDate.toISOString(),
        });
      } else {
        amountOwed += purchaseAmount;
      }
    }

    let status: "paid" | "unpaid" | "partial" = "paid";
    let dueDate = "";
    if (amountOwed > 0) {
      const paymentChance = Math.random();
      if (paymentChance < 0.5) { // 50% unpaid
        status = "unpaid";
      } else if (paymentChance < 0.8) { // 30% partial
        status = "partial";
        const partialPaymentAmount = getRandomAmount(amountOwed * 0.1, amountOwed * 0.9); // Wider partial payment range
        const paymentDate = new Date(lastPurchaseDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
         if (paymentDate.getTime() <= Date.now()) {
            paymentHistory.push({
              id: uuidv4(),
              date: paymentDate.toISOString().split("T")[0],
              amount: partialPaymentAmount,
              method: ["cash", "bank_transfer", "crypto"][Math.floor(Math.random() * 3)] as "cash" | "bank_transfer" | "crypto",
              notes: "Partial payment received",
              createdAt: paymentDate.toISOString(),
            });
            amountOwed -= partialPaymentAmount;
            updatedAt = paymentDate.toISOString();
         } else {
             status = "unpaid"; // If payment date is in future, treat as unpaid for now
         }
      } else { // 20% paid (but had debt initially)
         const paymentDate = new Date(lastPurchaseDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
         if(paymentDate.getTime() <= Date.now()){
            paymentHistory.push({
                id: uuidv4(),
                date: paymentDate.toISOString().split("T")[0],
                amount: amountOwed,
                method: "cash",
                notes: "Full payment of outstanding balance",
                createdAt: paymentDate.toISOString(),
            });
            amountOwed = 0;
            status = "paid";
            updatedAt = paymentDate.toISOString();
         } else {
             status = "unpaid"; // If payment date is in future, treat as unpaid
         }
      }

      if (amountOwed > 0) {
         // Ensure due date is in the future relative to the last purchase, or slightly past due
         const baseDueDate = Math.max(Date.now(), lastPurchaseDate.getTime());
         dueDate = new Date(baseDueDate + (Math.random() * 45 - 10) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      }

    }

    return {
      id: uuidv4(),
      name,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `${name.toLowerCase().replace(/ /g, ".")}@demo.com`, // Use .demo.com
      address: `${Math.floor(Math.random() * 9000) + 100} ${["Main", "Elm", "Oak", "Maple"][index % 4]} St, Demo City`,
      amountOwed: +amountOwed.toFixed(2),
      dueDate,
      status,
      paymentHistory,
      notes: Math.random() > 0.6 ? `Demo notes for ${name}. Prefers ${["Green", "White", "Mix"][index % 3]}.` : "", // More notes
      createdAt: createdAt.split("T")[0], // Store date only for consistency
      updatedAt: updatedAt.split("T")[0], // Store date only
    };
  });
};

const gramsToOunces = (grams: number) => grams / 28.3495;
const gramsToKg = (grams: number) => grams / 1000;
const ouncesToGrams = (ounces: number) => ounces * 28.3495;

// Generate demo inventory items
export const generateDemoInventory = (): InventoryItem[] => {
  const items = [
    { name: "Green", baseCostOz: 60, initialOz: 16, thresholdOz: 4, desc: "Affordable, reliable green." }, // ~453g initial, 113g threshold
    { name: "White", baseCostOz: 600, initialOz: 8, thresholdOz: 2, desc: "Premium, high-grade white." }, // ~226g initial, 56g threshold
    { name: "Mid-Grade Mix", baseCostOz: 150, initialOz: 10, thresholdOz: 3, desc: "Balanced hybrid blend." }, // ~283g initial, 85g threshold
    { name: "Low Stock Special", baseCostOz: 100, initialOz: 2, thresholdOz: 1, desc: "Limited quantity item." }, // ~56g initial, 28g threshold
  ];

  return items.map((item) => {
    // Simulate some usage already happened
    const currentOz = item.initialOz * (0.3 + Math.random() * 0.7); // Start with 30-100% of initial stock
    const currentGrams = ouncesToGrams(currentOz);
    const quantityKg = gramsToKg(currentGrams);
    // Vary purchase dates more
    const purchaseDate = getRandomRecentDate(90); // Purchase within last 90 days
    // Slight variation in actual cost vs base cost
    const costPerOz = item.baseCostOz * (0.95 + Math.random() * 0.1);
    // Calculate total cost based on the *initial* quantity purchased, not current quantity
    const initialPurchaseCost = item.initialOz * costPerOz;

    return {
      id: uuidv4(),
      name: item.name,
      description: item.desc,
      quantityOz: +currentOz.toFixed(2), // Current stock level
      // Keep G/KG for display formatting if needed, calculated from currentOz
      quantityG: +currentGrams.toFixed(2),
      quantityKg: +quantityKg.toFixed(3),
      purchaseDate: purchaseDate, // Date this batch was purchased
      costPerOz: +costPerOz.toFixed(2), // Cost per Oz for this batch
      totalCost: +initialPurchaseCost.toFixed(2), // Total cost of the initial purchase for this batch
      reorderThresholdG: ouncesToGrams(item.thresholdOz), // Store threshold in grams
    };
  });
};

// Generate demo transactions
export const generateDemoTransactions = (customers: Customer[], inventory: InventoryItem[]): Transaction[] => {
  const transactions: Transaction[] = [];
  const inventoryState = JSON.parse(JSON.stringify(inventory)); // Deep copy to track state during generation

  // Define retail prices per gram based on inventory item cost
  const getRetailPricePerGram = (itemName: string): number => {
    if (itemName.includes("Green")) return 10; // $60/oz cost -> $2.12/g cost -> $10/g retail (~370% markup)
    if (itemName.includes("White")) return 30; // $600/oz cost -> $21.16/g cost -> $30/g retail (~42% markup)
    if (itemName.includes("Mid-Grade")) return 15; // $150/oz cost -> $5.29/g cost -> $15/g retail (~183% markup)
    if (itemName.includes("Low Stock")) return 12; // $100/oz cost -> $3.53/g cost -> $12/g retail (~240% markup)
    return 10; // Default fallback
  };

  // Simulate initial inventory purchases based on the generated inventory state
  inventoryState.forEach((item: InventoryItem) => {
    // Find original item details to estimate initial quantity (this is imperfect)
    const originalItemDetails = [
        { name: "Green", initialOz: 16 }, { name: "White", initialOz: 8 },
        { name: "Mid-Grade Mix", initialOz: 10 }, { name: "Low Stock Special", initialOz: 2 }
    ].find(i => i.name === item.name);
    const initialOz = originalItemDetails ? originalItemDetails.initialOz : item.quantityOz / (0.3 + Math.random() * 0.7); // Estimate if not found

    const initialGrams = ouncesToGrams(initialOz);
    const purchaseCost = initialOz * item.costPerOz; // Use the costPerOz from the generated item

    transactions.push({
      id: uuidv4(),
      date: item.purchaseDate, // Use the purchase date from the inventory item
      type: "purchase",
      inventoryId: item.id,
      inventoryName: item.name,
      quantityGrams: +initialGrams.toFixed(2), // Log estimated initial purchase amount
      pricePerGram: 0, // Purchase cost is per Oz usually
      totalPrice: +purchaseCost.toFixed(2), // Log estimated total purchase cost
      cost: +purchaseCost.toFixed(2),
      profit: 0,
      paymentMethod: "bank_transfer",
      customerId: null,
      customerName: null,
      notes: `Stock Purchase: ${item.name}`,
      createdAt: new Date(item.purchaseDate).toISOString(), // Use purchase date for createdAt
    });
  });

  // Simulate sales transactions
  customers.forEach((customer) => {
    const numSales = Math.floor(Math.random() * 8); // Generate a decent number of sales per customer
    let lastActivityDate = new Date(Math.max(Date.parse(customer.createdAt), Date.now() - 180 * 24 * 60 * 60 * 1000)); // Start sales after creation or within last 180 days

    for (let i = 0; i < numSales; i++) {
      const saleDate = new Date(lastActivityDate.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000 + 3600 * 1000); // Ensure sales happen after last activity
      if (saleDate.getTime() > Date.now()) continue; // Don't create future sales
      lastActivityDate = saleDate;

      // Select an item that has stock
      const availableItems = inventoryState.filter((inv: InventoryItem) => inv.quantityOz > 0.1);
      if (availableItems.length === 0) continue; // No stock left to sell

      const inventoryItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      const itemIndex = inventoryState.findIndex((inv: InventoryItem) => inv.id === inventoryItem.id);

      // Vary sale quantity based on item type
      let quantityGrams = 0;
      if (inventoryItem.name.includes("White")) {
        quantityGrams = getRandomAmount(0.5, 5); // Smaller amounts for expensive items
      } else if (inventoryItem.name.includes("Green")) {
        quantityGrams = getRandomAmount(1, 28); // Larger amounts for cheaper items
      } else {
        quantityGrams = getRandomAmount(1, 15);
      }
      // Ensure we don't sell more than available
      quantityGrams = Math.min(quantityGrams, ouncesToGrams(inventoryState[itemIndex].quantityOz));

      if (quantityGrams < 0.1) continue; // Skip tiny sales

      const retailPricePerGram = getRetailPricePerGram(inventoryItem.name);
      const costPerGram = inventoryItem.costPerOz / 28.3495;
      const cost = quantityGrams * costPerGram;
      // Add slight price variation/discount (e.g., 90% to 110% of base retail)
      const priceMultiplier = 0.9 + Math.random() * 0.2;
      const totalPrice = quantityGrams * retailPricePerGram * priceMultiplier;
      const profit = totalPrice - cost;
      const paymentMethod = ["cash", "bank_transfer", "crypto", "credit"][Math.floor(Math.random() * 4)] as "cash" | "bank_transfer" | "crypto" | "credit";

      transactions.push({
        id: uuidv4(),
        date: saleDate.toISOString().split("T")[0],
        type: "sale",
        inventoryId: inventoryItem.id,
        inventoryName: inventoryItem.name,
        quantityGrams: +quantityGrams.toFixed(2),
        pricePerGram: +(totalPrice / quantityGrams).toFixed(2), // Actual price per gram for this transaction
        totalPrice: +totalPrice.toFixed(2),
        cost: +cost.toFixed(2),
        profit: +profit.toFixed(2),
        paymentMethod: paymentMethod,
        customerId: customer.id,
        customerName: customer.name,
        notes: `Sale: ${quantityGrams.toFixed(1)}g ${inventoryItem.name}. Method: ${paymentMethod}.`,
        createdAt: saleDate.toISOString(),
      });

       // Deduct sold quantity from inventory state
       const soldOz = gramsToOunces(quantityGrams);
       inventoryState[itemIndex].quantityOz = Math.max(0, inventoryState[itemIndex].quantityOz - soldOz);
       inventoryState[itemIndex].quantityG = ouncesToGrams(inventoryState[itemIndex].quantityOz);
    }
  });

  // Simulate payment transactions based on customer payment history
  customers.forEach((customer) => {
    customer.paymentHistory.forEach((payment) => {
      // Check if a similar payment transaction already exists (more robust check)
       if (!transactions.some(t => t.id === payment.id && t.type === 'payment')) {
           transactions.push({
             id: payment.id, // Use payment ID from customer history
             date: payment.date,
             type: "payment",
             inventoryId: null,
             inventoryName: null,
             quantityGrams: 0,
             pricePerGram: 0,
             totalPrice: payment.amount,
             cost: 0,
             profit: 0, // Payments don't directly generate profit in this context
             paymentMethod: payment.method,
             customerId: customer.id,
             customerName: customer.name,
             notes: payment.notes || `Payment from ${customer.name}`,
             createdAt: payment.createdAt,
           });
       }
    });
  });

  // Sort all transactions by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate all demo data
export const generateDemoData = () => {
  // Generate inventory first
  const inventory = generateDemoInventory();
  // Generate customers
  const customers = generateDemoCustomers();
   // Generate transactions using the generated customers and a fresh copy of the generated inventory
  const transactions = generateDemoTransactions(customers, inventory);

  // Return the final state
  // Note: The inventory returned here reflects the state *before* sales transactions were simulated.
  // If the app needs the *current* inventory state after sales, it should calculate it from transactions or modify this logic.
  return {
    customers,
    inventory,
    transactions,
  };
};
