import { describe, it, expect } from 'vitest'
import { toggleGrowthPriority } from './prepSelection'

describe('toggleGrowthPriority', () => {
  it('adds a new value when under the limit', () => {
    expect(toggleGrowthPriority(['engagement'], 'ai-digital')).toEqual({
      values: ['engagement', 'ai-digital'],
      reachedLimit: false,
      clearsOtherText: false,
    })
  })

  it('removes an already-selected value', () => {
    expect(toggleGrowthPriority(['engagement', 'ai-digital'], 'engagement')).toEqual({
      values: ['ai-digital'],
      reachedLimit: false,
      clearsOtherText: false,
    })
  })

  it('flags clearsOtherText when deselecting "other"', () => {
    expect(toggleGrowthPriority(['other'], 'other')).toEqual({
      values: [],
      reachedLimit: false,
      clearsOtherText: true,
    })
  })

  it('refuses a 4th selection and reports reachedLimit without changing values', () => {
    const current = ['engagement', 'ai-digital', 'other'] as const
    expect(toggleGrowthPriority([...current], 'lesson-workload')).toEqual({
      values: [...current],
      reachedLimit: true,
      clearsOtherText: false,
    })
  })
})
