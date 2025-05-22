'use server'

import { PricePoint } from '@/types'
import sql from '../db/db';

/**
 * Fetches the latest price from the database.
 * Returns the most recently updated price row.
 */
export async function getPrice(): Promise<PricePoint> {
  const result = await sql`SELECT id, value, updated_at FROM price ORDER BY updated_at DESC LIMIT 1`;
  if (!result || result.length === 0) {
    throw new Error('No price found. Please set a price.');
  }
  const row = result[0];
  const value = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
  return {
    id: row.id,
    value,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    // The following fields are not used for simple price fetch, set to 0 or undefined
    markupPercentage: 0,
    wholesalePricePerGram: value.wholesale ?? 0,
    retailPricePerGram: value.retail ?? 0,
    profitPerGram: 0,
    breakEvenGramsPerMonth: 0,
    breakEvenOuncesPerMonth: 0,
    monthlyRevenue: 0,
    monthlyCost: 0,
    monthlyProfit: 0,
    roi: 0,
    wholesale: value.wholesale ?? 0,
    retail: value.retail ?? 0,
  };
}