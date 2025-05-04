'use server'

import { PricePoint } from '@/types'
import sql from '../db';

/**
 * Updates the price in the database. If no price exists, inserts a new row.
 * Accepts wholesale and retail prices as numbers.
 */
export async function updatePrice({ wholesale, retail }: { wholesale: number; retail: number }) {
  const priceJson = { wholesale, retail };
  // Try to update the latest price row
  const result = await sql`UPDATE price SET value = ${JSON.stringify(priceJson)}, updated_at = CURRENT_TIMESTAMP RETURNING id, value, updated_at`;
  if (result.length > 0) {
    const value = typeof result[0].value === 'string' ? JSON.parse(result[0].value) : result[0].value;
    return {
      id: result[0].id,
      value,
      updatedAt: result[0].updated_at,
    };
  }
  // If no row was updated, insert a new price row
  const insert = await sql`INSERT INTO price (value) VALUES (${JSON.stringify(priceJson)}) RETURNING id, value, updated_at`;
  const value = typeof insert[0].value === 'string' ? JSON.parse(insert[0].value) : insert[0].value;
  return {
    id: insert[0].id,
    value,
    updatedAt: insert[0].updated_at,
  };
}