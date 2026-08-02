import { describe, expect, it } from 'vitest'
import {
  ANONYMOUS_JOURNEY_ID_STORAGE_KEY,
  JOURNEY_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  clearActiveSession,
  clearNbtiAndProgress,
  ensureAnonymousJourneyId,
  getStorageBackend,
  hasActiveSession,
  loadJourney,
  loadProfile,
  resolveDeviceMode,
  saveJourney,
  saveProfile,
  type Journey,
  type Profile,
  type StorageBackend,
  type StorageOptions,
} from './storage'

class MemoryStorage implements StorageBackend {
  readonly records = new Map<string, string>()
  failWrites = false

  getItem(key: string) { return this.records.get(key) ?? null }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error('storage blocked')
    this.records.set(key, value)
  }
  removeItem(key: string) {
    if (this.failWrites) throw new Error('storage blocked')
    this.records.delete(key)
  }
}

const profile: Profile = {
  version: 1,
  schoolLevel: 'elementary',
  careerRange: '1-5',
  region: 'seoul',
  growthPriorities: ['engagement', 'class-community'],
  growthPriorityOther: '',
  createdAt: '2026-08-02T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
}

const journey: Journey = { version: 1, status: 'nbti_in_progress', updatedAt: '2026-08-02T00:00:00.000Z' }

function stores(): { local: MemoryStorage; session: MemoryStorage; options: StorageOptions } {
  const local = new MemoryStorage()
  const session = new MemoryStorage()
  return { local, session, options: { localStorage: local, sessionStorage: session } }
}

describe('device-mode storage adapter', () => {
  it('defaults to personal and recognizes the shared and personal query forms', () => {
    expect(resolveDeviceMode('')).toBe('personal')
    expect(resolveDeviceMode('?device=personal')).toBe('personal')
    expect(resolveDeviceMode('?device=shared')).toBe('shared')
    expect(resolveDeviceMode('?device=unknown')).toBe('personal')
  })

  it('selects localStorage for personal and sessionStorage for shared', () => {
    const { local, session, options } = stores()
    expect(getStorageBackend('personal', options)).toBe(local)
    expect(getStorageBackend('shared', options)).toBe(session)
  })

  it('persists and restores a valid personal profile and journey', () => {
    const { local, options } = stores()
    expect(saveProfile(profile, 'personal', options).ok).toBe(true)
    expect(saveJourney(journey, 'personal', options).ok).toBe(true)
    expect(loadProfile('personal', options)).toMatchObject({ ok: true, value: profile })
    expect(loadJourney('personal', options)).toMatchObject({ ok: true, value: journey })
    expect(local.records.has(PROFILE_STORAGE_KEY)).toBe(true)
  })

  it('uses shared session storage without reading, writing, or clearing personal localStorage', () => {
    const { local, session, options } = stores()
    local.records.set(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    local.records.set(JOURNEY_STORAGE_KEY, JSON.stringify(journey))
    expect(loadProfile('shared', options)).toMatchObject({ ok: true, value: null })
    expect(saveProfile(profile, 'shared', options).ok).toBe(true)
    expect(saveJourney(journey, 'shared', options).ok).toBe(true)
    expect(ensureAnonymousJourneyId('shared', options).ok).toBe(true)
    expect(hasActiveSession('shared', options)).toMatchObject({ ok: true, value: true })
    expect(clearActiveSession('shared', options).ok).toBe(true)
    expect(session.records.size).toBe(0)
    expect(local.records.get(PROFILE_STORAGE_KEY)).toBe(JSON.stringify(profile))
    expect(local.records.get(JOURNEY_STORAGE_KEY)).toBe(JSON.stringify(journey))
  })

  it('keeps the anonymous journey identifier separate from profile selections', () => {
    const { session, options } = stores()
    const first = ensureAnonymousJourneyId('shared', options)
    const second = ensureAnonymousJourneyId('shared', options)
    expect(first.ok && second.ok && first.value).toBe(second.ok ? second.value : '')
    expect(session.records.get(ANONYMOUS_JOURNEY_ID_STORAGE_KEY)).not.toContain(profile.schoolLevel)
    expect(session.records.get(ANONYMOUS_JOURNEY_ID_STORAGE_KEY)).not.toContain(profile.region)
  })

  it('falls back safely from malformed values and preserves a usable new journey', () => {
    const { local, options } = stores()
    local.records.set(PROFILE_STORAGE_KEY, '{not-json')
    local.records.set(JOURNEY_STORAGE_KEY, JSON.stringify({ version: 1, status: 'unexpected' }))
    expect(loadProfile('personal', options)).toMatchObject({ ok: true, value: null })
    expect(loadJourney('personal', options)).toMatchObject({ ok: true, value: { version: 1, status: 'new' } })
  })

  it('rejects an invalid other-selection profile rather than restoring incomplete data', () => {
    const { local, options } = stores()
    local.records.set(PROFILE_STORAGE_KEY, JSON.stringify({ ...profile, growthPriorities: ['other'], growthPriorityOther: '' }))
    expect(loadProfile('personal', options)).toMatchObject({ ok: true, value: null })
  })

  it('returns explicit failures when storage is blocked and never reports a false save', () => {
    const { local, options } = stores()
    local.failWrites = true
    expect(saveProfile(profile, 'personal', options).ok).toBe(false)
    expect(saveJourney(journey, 'personal', options).ok).toBe(false)
    expect(clearNbtiAndProgress('personal', options).ok).toBe(false)
  })
})
