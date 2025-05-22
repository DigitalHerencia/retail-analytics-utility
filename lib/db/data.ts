import { v4 as uuidv4 } from "uuid"

// Default business data
export const defaultBusinessData = {
  wholesalePricePerOz: 100,
  targetProfitPerMonth: 2000,
  operatingExpenses: 500,
  targetProfit: undefined,
};

// Default markup percentages
export const defaultMarkupPercentages = [50, 75, 100, 125, 150];

export const ouncesToGrams = (ounces: number) => {
  return ounces * 28.3495
}

export const gramsToOunces = (grams: number) => grams / 28.3495;
export const gramsToKg = (grams: number) => grams / 1000;

// Business concept explanations
export const businessConcepts = {
  markup:
    "Markup is the percentage you add to your cost to set your price. Higher markup means more cash in your pocket per sale, but might slow down your volume.",
  breakEven:
    "Break-even is how much product you need to move to cover your costs. After this point, you're making pure profit.",
  roi: "Return on Investment (ROI) shows how hard your money is working for you. Higher ROI means your cash is making more cash.",
  profit: "Profit is what's left after all costs are paid. This is your take-home, your real earnings.",
  wholesale:
    "Wholesale price is what you pay to get your product. Finding the right supplier with the best prices is key to maximizing profits.",
  retail:
    "Retail price is what your customers pay. Set it too high, they walk away. Set it too low, you're leaving money on the table.",
  margin:
    "Profit margin is the percentage of your selling price that's pure profit. Higher margins mean more money in your pocket per sale.",
  inventory:
    "Inventory is your product on hand. Too much ties up your cash, too little means missed sales. Balance is key.",
  cashFlow:
    "Cash flow is money moving in and out of your business. Positive flow means you're stacking paper, negative means you're bleeding cash.",
  accounts:
    "Accounts receivable is money owed to you. Stay on top of collections - in this game, respect comes from getting paid on time.",
}

// Hustle tips
export const hustleTips = [
  "Quality product commands premium prices. Don't compete on price alone.",
  "Know your best sellers and keep them stocked. Never run dry on what makes you money.",
  "Adjust your prices based on demand. When they want it more, charge more.",
  "Count all costs - product, time, risk. If you're not making money, you're wasting time.",
  "Review your prices regularly. The game changes, your prices should too.",
  "Offer bulk discounts to your best customers. Move more product, keep them loyal.",
  "Watch your competition but don't follow them. Be the leader, not the follower.",
  "Presentation matters. Premium packaging justifies premium prices.",
  "Different customers, different prices. Know who can pay more and charge accordingly.",
  "Test different price points. Find what maximizes your total profit, not just per-unit profit.",
]
