import type { GrowthPriority } from '../data/adventure'

export function toggleGrowthPriority(current: GrowthPriority[], value: GrowthPriority): { values: GrowthPriority[]; reachedLimit: boolean; clearsOtherText: boolean } {
  if (current.includes(value)) {
    return { values: current.filter((priority) => priority !== value), reachedLimit: false, clearsOtherText: value === 'other' }
  }
  if (current.length >= 3) return { values: current, reachedLimit: true, clearsOtherText: false }
  return { values: [...current, value], reachedLimit: false, clearsOtherText: false }
}
