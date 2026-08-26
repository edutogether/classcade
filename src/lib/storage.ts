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
export const PAIRING_ISSUED_CODE_STORAGE_KEY = 'classcade.pairing-issued-code.v1'
export const PREP_DRAFT_STORAGE_KEY = 'classcade.prep-draft.v1'

const NBTI_PROGRESS_STORAGE_KEY = 'classcade.nbti.v1'
const GAME_PROGRESS_STORAGE_KEY = 'classcade.game.v1'

export type DeviceMode = 'personal' | 'shared'
export type DeviceRole = 'mobile-participant' | 'laptop-station'

export type Profile = {
  version: 1
  schoolLevel: SchoolLevel
  careerRange: CareerRange
  region: Region
  growthPriorities: GrowthPriority[]
  growthPriorityOther: string
  nickname: string
  createdAt: string
  updatedAt: string
}

export type Journey = {
  version: 1
  status: JourneyStatus
  updatedAt: string
}

export type PrepStepValue = 1 | 2 | 3 | 4 | 'nickname'

export type PrepDraft = {
  version: 1
  step: PrepStepValue
  schoolLevel: SchoolLevel | null
  careerRange: CareerRange | null
  region: Region | null
  growthPriorities: GrowthPriority[]
  growthPriorityOther: string
  nickname: string
}

export type StorageBackend = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type StorageOptions = {
  localStorage?: StorageBackend | null
  sessionStorage?: StorageBackend | null
}

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; value: T; reason: 'unavailable' | 'read_failed' | 'write_failed' }

const journeyStatuses: JourneyStatus[] = ['new', 'nbti_in_progress', 'nbti_complete']
const sessionKeys = [PROFILE_STORAGE_KEY, JOURNEY_STORAGE_KEY, JOURNEY_STATE_STORAGE_KEY, ANONYMOUS_JOURNEY_ID_STORAGE_KEY, NBTI_PROGRESS_STORAGE_KEY, GAME_PROGRESS_STORAGE_KEY, PAIRING_ISSUED_CODE_STORAGE_KEY, PREP_DRAFT_STORAGE_KEY]
const hasValue = <T extends string>(options: readonly { value: T }[], value: unknown): value is T =>
  typeof value === 'string' && options.some((option) => option.value === value)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const legacySchoolLevel: Record<string, SchoolLevel> = { 'special-other': 'special' }
// Forward-compat for profiles saved during the briefly-merged 10-region period.
const legacyRegion: Record<string, Region> = {
  'busan-ulsan-gyeongnam': 'busan',
  'daegu-gyeongbuk': 'daegu',
  'daejeon-sejong': 'daejeon',
  chungcheong: 'chungbuk',
  'gwangju-jeonnam': 'gwangju',
}

function normalizeOption<T extends string>(options: readonly { value: T }[], legacy: Record<string, T>, value: unknown): T | null {
  if (hasValue(options, value)) return value
  return typeof value === 'string' ? legacy[value] ?? null : null
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

/**
 * Resolve the browser-selected device context. Shared (sessionStorage, per-tab) is the
 * default: booth machines are shared devices, so a new window must always start fresh
 * while a refresh in the same tab keeps the visitor's progress. `?device=personal`
 * opts back into persistent localStorage.
 */
export function resolveDeviceMode(search = currentSearch()): DeviceMode {
  try {
    return new URLSearchParams(search).get('device') === 'personal' ? 'personal' : 'shared'
  } catch {
    return 'shared'
  }
}

/** Role is explicit when supplied; legacy device mode only provides a safe compatibility default. */
export function resolveDeviceRole(search = currentSearch()): DeviceRole {
  try { return new URLSearchParams(search).get('role') === 'laptop-station' || new URLSearchParams(search).get('device') === 'shared' ? 'laptop-station' : 'mobile-participant' } catch { return 'mobile-participant' }
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
  const schoolLevel = normalizeOption(SCHOOL_LEVEL_OPTIONS, legacySchoolLevel, value.schoolLevel)
  const region = normalizeOption(REGION_OPTIONS, legacyRegion, value.region)
  if (!schoolLevel || !hasValue(CAREER_RANGE_OPTIONS, value.careerRange) || !region) return null
  if (!Array.isArray(value.growthPriorities) || value.growthPriorities.length < 1 || value.growthPriorities.length > 3) return null

  const growthPriorities = value.growthPriorities.filter((priority): priority is GrowthPriority => hasValue(GROWTH_PRIORITY_OPTIONS, priority))
  if (growthPriorities.length !== value.growthPriorities.length || new Set(growthPriorities).size !== growthPriorities.length) return null

  const growthPriorityOther = typeof value.growthPriorityOther === 'string' ? value.growthPriorityOther.trim().slice(0, 30) : ''
  if (growthPriorities.includes('other') && !growthPriorityOther) return null

  return {
    version: 1,
    schoolLevel,
    careerRange: value.careerRange,
    region,
    growthPriorities,
    growthPriorityOther: growthPriorities.includes('other') ? growthPriorityOther : '',
    nickname: typeof value.nickname === 'string' ? value.nickname.trim().slice(0, 16) : '',
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

const prepSteps: PrepStepValue[] = [1, 2, 3, 4, 'nickname']

/** Unlike Profile, every field here is allowed to be incomplete - this is a mid-flow draft, not a finished record. */
export function validatePrepDraft(value: unknown): PrepDraft | null {
  if (!isRecord(value) || value.version !== 1 || !prepSteps.includes(value.step as PrepStepValue)) return null
  const schoolLevel = value.schoolLevel === null ? null : normalizeOption(SCHOOL_LEVEL_OPTIONS, legacySchoolLevel, value.schoolLevel)
  const region = value.region === null ? null : normalizeOption(REGION_OPTIONS, legacyRegion, value.region)
  const careerRange = value.careerRange === null ? null : (hasValue(CAREER_RANGE_OPTIONS, value.careerRange) ? value.careerRange : undefined)
  if (schoolLevel === undefined || region === undefined || careerRange === undefined) return null
  if (!Array.isArray(value.growthPriorities)) return null

  const growthPriorities = value.growthPriorities.filter((priority): priority is GrowthPriority => hasValue(GROWTH_PRIORITY_OPTIONS, priority))
  if (growthPriorities.length !== value.growthPriorities.length || new Set(growthPriorities).size !== growthPriorities.length || growthPriorities.length > 3) return null

  return {
    version: 1,
    step: value.step as PrepStepValue,
    schoolLevel,
    careerRange,
    region,
    growthPriorities,
    growthPriorityOther: typeof value.growthPriorityOther === 'string' ? value.growthPriorityOther.trim().slice(0, 30) : '',
    nickname: typeof value.nickname === 'string' ? value.nickname.trim().slice(0, 16) : '',
  }
}

export function loadPrepDraft(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<PrepDraft | null> {
  const backend = getStorageBackend(deviceMode, options)
  const stored = read(backend, PREP_DRAFT_STORAGE_KEY)
  if (!stored.ok || !stored.value) return stored.ok ? { ok: true, value: null } : { ...stored, value: null }

  try {
    const draft = validatePrepDraft(JSON.parse(stored.value))
    if (draft) return { ok: true, value: draft }
  } catch {
    // Invalid browser data is discarded by falling back to a fresh Prep 1.
  }
  remove(backend, PREP_DRAFT_STORAGE_KEY)
  return { ok: true, value: null }
}

export function savePrepDraft(draft: PrepDraft, deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<PrepDraft> {
  const result = write(getStorageBackend(deviceMode, options), PREP_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  return result.ok ? { ok: true, value: draft } : { ...result, value: draft }
}

export function clearPrepDraft(deviceMode: DeviceMode = resolveDeviceMode(), options?: StorageOptions): StorageResult<undefined> {
  return remove(getStorageBackend(deviceMode, options), PREP_DRAFT_STORAGE_KEY)
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
  const profile = loadProfile(deviceMode, options)
  if (!profile.ok) return { ...profile, value: false }
  const journey = loadJourney(deviceMode, options)
  if (!journey.ok) return { ...journey, value: false }
  return { ok: true, value: profile.value !== null && journey.value.status !== 'new' }
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
