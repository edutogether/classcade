import { describe, expect, it } from 'vitest'
import { createTuning, validateTuning, valuesFor, withinRange } from './visualTuning'

describe('Front120 visual tuning contract', () => {
  it('starts with a complete, valid official tuning shape', () => {
    const tuning = createTuning()
    expect(validateTuning(tuning)).toBe(true)
    expect(Object.keys(tuning.screens)).toHaveLength(7)
  })

  it('accepts only allowlisted finite values in their ranges', () => {
    const tuning = createTuning()
    tuning.screens['prep-1'] = { 'panel-max-width': 900 }
    expect(validateTuning(tuning)).toBe(true)
    expect(withinRange('panel-max-width', 900)).toBe(true)
    expect(withinRange('panel-max-width', Infinity)).toBe(false)
    expect(validateTuning({ ...tuning, global: { 'not-a-token': 1 } })).toBe(false)
  })

  it('merges a screen override without changing other screen defaults', () => {
    const tuning = createTuning()
    tuning.screens.loading = { 'loading-track-height': 30 }
    expect(valuesFor(tuning, 'loading')['loading-track-height']).toBe(30)
    expect(valuesFor(tuning, 'prep-1')['loading-track-height']).toBe(22)
  })
})
