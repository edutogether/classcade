import {
  CAREER_RANGE_OPTIONS,
  GROWTH_PRIORITY_OPTIONS,
  REGION_OPTIONS,
  SCHOOL_LEVEL_OPTIONS,
  type CareerRange,
  type GrowthPriority,
  type JourneyStatus,
  type Region,
  type SchoolLevel,
} from '../data/adventure'

export const PROFILE_STORAGE_KEY = 'classcade.profile.v1'
export const JOURNEY_STORAGE_KEY = 'classcade.journey.v1'
export const JOURNEY_STATE_STORAGE_KEY = 'classcade.journey-state.v1'
export const ANONYMOUS_JOURNEY_ID_STORAGE_KEY = 'classcade.anonymous-journey-id.v1'

const NBTI_PROGRESS_STORAGE_KEY = 'classcade.nbti.v1'
const GAME_PROGRESS_STORAGE_KEY = 'classcade.game.v1'

export type DeviceMode = 'personal' | 'shared'

export type Profile = {
  version: 1
  schoolLevel: SchoolLevel
  careerRange: CareerRange
  region: Region
  growthPriorities: GrowthPriority[]
  growthPriorityOther: string
  createdAt: string
  updatedAt: string
}

export type Journey = {
  version: 1
  status: JourneyStatus
  updatedAt: string
}

export type StorageBackend = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type StorageOptions = {
  localStorage?: StorageBackend | null
  sessionStorage?: StorageBackend | null
}

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; value: T; reason: 'unavailable' | 'read_failed' | 'write_failed' }

const journeyStatuses: JourneyStatus[] = ['new', 'nbti_in_progress', 'nbti_complete', 'game_in_progress', 'complete']
const sessionKeys = [PROFILE_STORAGE_KEY, JOURNEY_STORAGE_KEY, JOURNEY_STATE_STORAGE_KEY, ANONYMOUS_JOURNEY_ID_STORAGE_KEY, NBTI_PROGRESS_STORAGE_KEY, GAME_PROGRESS_STORAGE_KEY]
const hasValue = <T extends string>(options: readonly { value: T }[], value: unknown): value is T =>
  typeof value === 'string' && options.some((option) => option.value === value)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function nowJourney(): Journey {
  return { version: 1, status: 'new', updatedAt: new Date().toISOString() }
}

function currentSearch() {
  try {
    return window.location.search
  } catch {
    return ''
  }
}

/** Resolve the browser-selected device context. Personal is deliberately the safe default. */
export function resolveDeviceMode(search = currentSearch()): DeviceMode {
  try {
    return new URLSearchParams(search).get('device') === 'shared' ? 'shared' : 'personal'
  } catch {
    return 'personal'
  }
}

/**
 * The adapter boundary keeps this local prototype ready for a future Firestore-backed
 * implementation without letting UI code access browser storage directly.
 */
export function getStorageBackend(deviceMode: DeviceMode, options: StorageOptions = {}): StorageBackend | null {
  const configured = deviceMode === 'shared' ? options.sessionStorage : options.localStorage
  if (configured !== undefined) return configured

  try {
    return deviceMode === 'shared' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

function read(backend: StorageBackend | null, key: string): StorageResult<string | null> {
  if (!backend) return { ok: false, value: null, reason: 'unavailable' }
  try {
    return { ok: true, value: backend.getItem(key) }
  } catch {
    return { ok: false, value: null, reason: 'read_failed' }
  }
}

function write(backend: StorageBackend | null, key: string, value: string): StorageResult<undefined> {
  if (!backend) return { ok: false, value: undefined, reason: 'unavailable' }
  try {
    backend.setItem(key, value)
    return { ok: true, value: undefined }
  } catch {
    return { ok: false, value: undefined, reason: 'write_failed' }
  }
}

function remove(backend: StorageBackend | null, key: string): StorageResult<undefined> {
  if (!backend) return { ok: false, value: undefined, reason: 'unavailable' }
  try {
    backend.removeItem(key)
    return { ok: true, value: undefined }
  } catch {
    return { ok: false, value: undefined, reason: 'write_failed' }
  }
}

export function validateProfile(value: unknown): Profile | null {
  if (!isRecord(value) || value.version !== 1) return null
  if (!hasValue(SCHOOL_LEVEL_OPTIONS, value.schoolLevel) || !hasValue(CAREER_RANGE_OPTIONS, value.careerRange) || !hasValue(REGION_OPTIONS, value.region)) return null
  if (!Array.isArray(value.growthPriorities) || value.growthPriorities.length < 1 || value.growthPriorities.length > 3) return null

  const growthPriorities = value.growthPriorities.filter((priority): priority is GrowthPriority => hasValue(GROWTH_PRIORITY_OPTIONS, priority))
  if (growthPriorities.length !== value.growthPriorities.length || new Set(growthPriorities).size !== growthPriorities.length) return null

  const growthPriorityOther = typeof value.growthPriorityOther === 'string' ? value.growthPriorityOther.trim().slice(0, 30) : ''
  if (growthPriorities.includes('other') && !growthPriorityOther) return null

  return {
    version: 1,
    schoolLevel: value.schoolLevel,
    careerRange: value.careerRange,
    region: value.region,
    growthPriorities,
    growthPriorityOther: growthPriorities.includes('other') ? growthPriorityOther : '',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }
}

function validateJourney(value: unknown): Journey | null {
  if (!isRecord(value) || value.version !== 1 || !journeyStatuses.includes(value.status as JourneyStatus)) return null
  return {
    version: 1,
    status: value.status as JourneyStatus,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }
}

export function loadProfile(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<Profile | null> {
  const backend = getStorageBackend(deviceMode, options)
  const stored = read(backend, PROFILE_STORAGE_KEY)
  if (!stored.ok || !stored.value) return stored.ok ? { ok: true, value: null } : { ...stored, value: null }

  try {
    const profile = validateProfile(JSON.parse(stored.value))
    if (profile) return { ok: true, value: profile }
  } catch {
    // Invalid browser data is discarded by falling back to the preparation screen.
  }
  remove(backend, PROFILE_STORAGE_KEY)
  return { ok: true, value: null }
}

export function saveProfile(profile: Profile, deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<Profile> {
  const result = write(getStorageBackend(deviceMode, options), PROFILE_STORAGE_KEY, JSON.stringify(profile))
  return result.ok ? { ok: true, value: profile } : { ...result, value: profile }
}

export function clearProfile(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<undefined> {
  return remove(getStorageBackend(deviceMode, options), PROFILE_STORAGE_KEY)
}

export function loadJourney(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<Journey> {
  const fallback = nowJourney()
  const backend = getStorageBackend(deviceMode, options)
  const stored = read(backend, JOURNEY_STORAGE_KEY)
  if (!stored.ok || !stored.value) return stored.ok ? { ok: true, value: fallback } : { ...stored, value: fallback }

  try {
    const journey = validateJourney(JSON.parse(stored.value))
    if (journey) return { ok: true, value: journey }
  } catch {
    // Safe fallback below.
  }
  remove(backend, JOURNEY_STORAGE_KEY)
  return { ok: true, value: fallback }
}

export function saveJourney(journey: Journey, deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<Journey> {
  const result = write(getStorageBackend(deviceMode, options), JOURNEY_STORAGE_KEY, JSON.stringify(journey))
  return result.ok ? { ok: true, value: journey } : { ...result, value: journey }
}

export function clearJourney(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<undefined> {
  return remove(getStorageBackend(deviceMode, options), JOURNEY_STORAGE_KEY)
}

export function loadAnonymousJourneyId(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<string | null> {
  const stored = read(getStorageBackend(deviceMode, options), ANONYMOUS_JOURNEY_ID_STORAGE_KEY)
  if (!stored.ok || !stored.value) return stored.ok ? { ok: true, value: null } : { ...stored, value: null }
  return stored.value.length >= 12 ? stored : { ok: true, value: null }
}

function createAnonymousJourneyId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {
    // Continue to the non-identifying fallback.
  }
  return `journey-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/** A separate anonymous token is intentionally never derived from profile selections. */
export function ensureAnonymousJourneyId(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<string> {
  const existing = loadAnonymousJourneyId(deviceMode, options)
  if (existing.ok && existing.value) return { ok: true, value: existing.value }
  if (!existing.ok) return { ...existing, value: '' }

  const id = createAnonymousJourneyId()
  const saved = write(getStorageBackend(deviceMode, options), ANONYMOUS_JOURNEY_ID_STORAGE_KEY, id)
  return saved.ok ? { ok: true, value: id } : { ...saved, value: id }
}

/** Detects only the active backend; it never probes the other device mode. */
export function hasActiveSession(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<boolean> {
  const backend = getStorageBackend(deviceMode, options)
  for (const key of [PROFILE_STORAGE_KEY, JOURNEY_STORAGE_KEY, ANONYMOUS_JOURNEY_ID_STORAGE_KEY]) {
    const stored = read(backend, key)
    if (!stored.ok) return { ...stored, value: false }
    if (stored.value) return { ok: true, value: true }
  }
  return { ok: true, value: false }
}

/** Clears future NBTI result/answer data and game progress while retaining basic profile data. */
export function clearNbtiAndProgress(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<undefined> {
  const backend = getStorageBackend(deviceMode, options)
  for (const key of [NBTI_PROGRESS_STORAGE_KEY, GAME_PROGRESS_STORAGE_KEY, JOURNEY_STATE_STORAGE_KEY]) {
    const result = remove(backend, key)
    if (!result.ok) return result
  }
  return { ok: true, value: undefined }
}

/** Clears only the active device-mode namespace. Shared mode never touches personal localStorage. */
export function clearActiveSession(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<undefined> {
  const backend = getStorageBackend(deviceMode, options)
  for (const key of sessionKeys) {
    const result = remove(backend, key)
    if (!result.ok) return result
  }
  return { ok: true, value: undefined }
}
