'use server'
import { v4 as uuidv4 } from 'uuid'
import type { InventoryItem } from '@/types'
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../fetchers'

export async function addInventoryItem(tenantId: string, formData: FormData) {
  // Parse and transform formData to InventoryItem shape
  const name = String(formData.get('name'))
  const description = String(formData.get('description') || '')
  const quantity = Number(formData.get('quantity'))
  const unit = String(formData.get('unit'))
  const costPerOz = Number(formData.get('costPerOz'))
  const purchaseDate = String(formData.get('purchaseDate'))
  const reorderThresholdG = Number(formData.get('reorderThresholdG'))

  let quantityG = quantity
  if (unit === 'oz') quantityG = quantity * 28.3495
  if (unit === 'kg') quantityG = quantity * 1000

  const quantityOz = quantityG / 28.3495
  const quantityKg = quantityG / 1000
  const totalCost = costPerOz * quantityOz

  const item: InventoryItem = {
    id: uuidv4(),
    tenantId,
    name,
    description,
    quantityG,
    quantityOz,
    quantityKg,
    purchaseDate,
    costPerOz,
    totalCost,
    reorderThresholdG,
  }
  await createInventoryItem(tenantId, item)
  return item
}

export async function editInventoryItem(tenantId: string, id: string, formData: FormData) {
  // Same parsing as add, but with id
  // ...parse as above...
  // ...build updatedItem...
  // await updateInventoryItem(tenantId, updatedItem)
  // return updatedItem
}

export async function removeInventoryItem(tenantId: string, id: string) {
  await deleteInventoryItem(tenantId, id)
  return { success: true }
}


