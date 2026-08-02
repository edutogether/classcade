import { describe, expect, it } from 'vitest'
import { JOURNEY_STATE_STORAGE_KEY, type StorageBackend, type StorageOptions } from '../../lib/storage'
import { clearJourneyState, loadJourneyState, saveJourneyState } from './journeyPersistence'
import { createJourneyState } from './journeyState'

class MemoryStorage implements StorageBackend {
  readonly values = new Map<string, string>()
  failWrites = false
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { if (this.failWrites) throw new Error('blocked'); this.values.set(key, value) }
  removeItem(key: string) { if (this.failWrites) throw new Error('blocked'); this.values.delete(key) }
}

describe('detailed journey persistence', () => {
  it('uses the current device-mode backend and restores a valid record', () => {
    const local = new MemoryStorage()
    const session = new MemoryStorage()
    const options: StorageOptions = { localStorage: local, sessionStorage: session }
    const state = createJourneyState()
    expect(saveJourneyState(state, 'shared', options).ok).toBe(true)
    expect(session.values.has(JOURNEY_STATE_STORAGE_KEY)).toBe(true)
    expect(local.values.has(JOURNEY_STATE_STORAGE_KEY)).toBe(false)
    expect(loadJourneyState('shared', options)).toMatchObject({ ok: true, value: { stage: 'nbti_start' } })
  })

  it('drops invalid records and reports blocked writes without a false success', () => {
    const local = new MemoryStorage()
    const options: StorageOptions = { localStorage: local }
    local.values.set(JOURNEY_STATE_STORAGE_KEY, '{bad')
    expect(loadJourneyState('personal', options)).toMatchObject({ ok: true, value: null })
    local.failWrites = true
    expect(saveJourneyState(createJourneyState(), 'personal', options).ok).toBe(false)
    expect(clearJourneyState('personal', options).ok).toBe(false)
  })
})
