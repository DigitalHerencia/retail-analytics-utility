'use server';

import { revalidatePath } from 'next/cache';
import { updatePrice } from '../fetchers/updatePrice';

/**
 * Server action to update the price in the database.
 * Accepts FormData with 'wholesalePricePerOz', 'markupPercentage', and 'retailPricePerGram' fields.
 */
export async function updatePriceAction(formData: FormData) {
  // Accept the correct field names from the form
  const wholesalePricePerOz = Number(formData.get('wholesalePricePerOz'));
  const markupPercentage = Number(formData.get('markupPercentage'));
  const retailPricePerGram = Number(formData.get('retailPricePerGram'));

  if (
    isNaN(wholesalePricePerOz) ||
    isNaN(markupPercentage) ||
    isNaN(retailPricePerGram)
  ) {
    throw new Error('Invalid input values');
  }

  if (wholesalePricePerOz < 0.01 || markupPercentage < 1 || retailPricePerGram < 0.01) {
    throw new Error('Input values out of range');
  }

  // Optionally, add business logic validation
  const wholesalePerGram = wholesalePricePerOz / 28.35;
  if (retailPricePerGram < wholesalePerGram) {
    throw new Error('Retail price per gram must be higher than wholesale cost per gram');
  }

  try {
    // Update price in the database directly (server action best practice)
    await updatePrice({
      wholesale: wholesalePricePerOz / 28.35,
      retail: retailPricePerGram,
    });
    revalidatePath('/pricing');
  } catch (error) {
    console.error('Failed to update price:', error);
    throw new Error('Failed to update price. Please try again.');
  }
}
