'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server action to update the price in the database.
 * Accepts FormData with 'wholesale' and 'retail' fields.
 */
export async function updatePriceAction(formData: FormData) {
  const wholesale = Number(formData.get('wholesale'));
  const retail = Number(formData.get('retail'));

  if (isNaN(wholesale) || isNaN(retail)) {
    throw new Error('Invalid price values');
  }

  if (wholesale < 0 || retail < 0) {
    throw new Error('Prices cannot be negative');
  }

  if (retail < wholesale) {
    throw new Error('Retail price must be higher than wholesale price');
  }

  try {
    // TODO: Replace with your actual price update logic
    await fetch('/api/price/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wholesale, retail }),
    });

    // Revalidate the pricing page to show updated data
    revalidatePath('/pricing');
  } catch (error) {
    console.error('Failed to update price:', error);
    throw new Error('Failed to update price. Please try again.');
  }
}
