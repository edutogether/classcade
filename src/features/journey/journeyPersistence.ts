import { JOURNEY_STATE_STORAGE_KEY, getStorageBackend, read, write, remove, type DeviceMode, type StorageOptions, type StorageResult } from '../../lib/storage'
import { validateJourneyState, type JourneyState } from './journeyState'

export function loadJourneyState(deviceMode: DeviceMode, options?: StorageOptions): StorageResult<JourneyState | null> {
  const backend = getStorageBackend(deviceMode, options)
  const stored = read(backend, JOURNEY_STATE_STORAGE_KEY)
  if (!stored.ok || !stored.value) return stored.ok ? { ok: true, value: null } : { ...stored, value: null }

  try {
    const journeyState = validateJourneyState(JSON.parse(stored.value))
    if (journeyState) return { ok: true, value: journeyState }
  } catch {
    // A malformed record falls through to the safe discard below.
  }
  remove(backend, JOURNEY_STATE_STORAGE_KEY)
  return { ok: true, value: null }
}

export function saveJourneyState(state: JourneyState, deviceMode: DeviceMode, options?: StorageOptions): StorageResult<JourneyState> {
  const result = write(getStorageBackend(deviceMode, options), JOURNEY_STATE_STORAGE_KEY, JSON.stringify(state))
  return result.ok ? { ok: true, value: state } : { ...result, value: state }
}

export function clearJourneyState(deviceMode: DeviceMode, options?: StorageOptions): StorageResult<undefined> {
  return remove(getStorageBackend(deviceMode, options), JOURNEY_STATE_STORAGE_KEY)
}
