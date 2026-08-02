import { JOURNEY_STATE_STORAGE_KEY, getStorageBackend, type DeviceMode, type StorageOptions, type StorageResult } from '../../lib/storage'
import { validateJourneyState, type JourneyState } from './journeyState'

export function loadJourneyState(deviceMode: DeviceMode, options?: StorageOptions): StorageResult<JourneyState | null> {
  const backend = getStorageBackend(deviceMode, options)
  if (!backend) return { ok: false, value: null, reason: 'unavailable' }
  try {
    const raw = backend.getItem(JOURNEY_STATE_STORAGE_KEY)
    if (!raw) return { ok: true, value: null }
    try {
      const journeyState = validateJourneyState(JSON.parse(raw))
      if (journeyState) return { ok: true, value: journeyState }
    } catch {
      // A malformed record falls through to the safe discard below.
    }
    try { backend.removeItem(JOURNEY_STATE_STORAGE_KEY) } catch { /* Safe fallback remains usable even when cleanup is blocked. */ }
    return { ok: true, value: null }
  } catch {
    return { ok: false, value: null, reason: 'read_failed' }
  }
}

export function saveJourneyState(state: JourneyState, deviceMode: DeviceMode, options?: StorageOptions): StorageResult<JourneyState> {
  const backend = getStorageBackend(deviceMode, options)
  if (!backend) return { ok: false, value: state, reason: 'unavailable' }
  try {
    backend.setItem(JOURNEY_STATE_STORAGE_KEY, JSON.stringify(state))
    return { ok: true, value: state }
  } catch {
    return { ok: false, value: state, reason: 'write_failed' }
  }
}

export function clearJourneyState(deviceMode: DeviceMode, options?: StorageOptions): StorageResult<undefined> {
  const backend = getStorageBackend(deviceMode, options)
  if (!backend) return { ok: false, value: undefined, reason: 'unavailable' }
  try {
    backend.removeItem(JOURNEY_STATE_STORAGE_KEY)
    return { ok: true, value: undefined }
  } catch {
    return { ok: false, value: undefined, reason: 'write_failed' }
  }
}
