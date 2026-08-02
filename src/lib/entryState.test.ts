import { describe, expect, it } from 'vitest'
import { resolveEntryState } from './entryState'
import { toggleGrowthPriority } from './prepSelection'
import type { Profile } from './storage'

const profile: Profile = {
  version: 1,
  schoolLevel: 'elementary',
  careerRange: '1-5',
  region: 'seoul',
  growthPriorities: ['engagement'],
  growthPriorityOther: '',
  createdAt: '2026-08-02T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
}

describe('entry and preparation decisions', () => {
  it('skips preparation for a valid personal profile', () => {
    expect(resolveEntryState('personal', profile, false)).toEqual({ screen: 'start', sharedSessionGateOpen: false })
  })

  it('shows the neutral shared-session gate before any profile details', () => {
    expect(resolveEntryState('shared', profile, true)).toEqual({ screen: 'start', sharedSessionGateOpen: true })
  })

  it('falls back to preparation when no valid profile exists', () => {
    expect(resolveEntryState('personal', null, false)).toEqual({ screen: 'prep', sharedSessionGateOpen: false })
  })

  it('rejects a fourth growth priority without altering the first three', () => {
    const current = ['engagement', 'class-community', 'ai-digital'] as const
    expect(toggleGrowthPriority([...current], 'other')).toEqual({ values: [...current], reachedLimit: true, clearsOtherText: false })
  })

  it('removes an other selection and asks the caller to clear its text', () => {
    expect(toggleGrowthPriority(['engagement', 'other'], 'other')).toEqual({ values: ['engagement'], reachedLimit: false, clearsOtherText: true })
  })
})
