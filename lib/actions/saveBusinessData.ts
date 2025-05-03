'use server'
import { saveBusinessData as saveBusinessDataFetcher } from '../fetchers'
import type { BusinessData } from '@/types'

export async function saveBusinessData(userId: string, data: BusinessData) {
  // You may want to add validation or logging here
  return await saveBusinessDataFetcher(userId, data)
}