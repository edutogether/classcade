import { PAIRING_ISSUED_CODE_STORAGE_KEY, type StorageBackend } from './storage'

type PairingModule = typeof import('../features/pairing/activePairingCode')

export async function revokePairingIfPresent(backend: StorageBackend | null, load: () => Promise<Pick<PairingModule, 'revokeActivePairingCode'>>) {
  try {
    if (backend && backend.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY) === null) return 'not_active' as const
  } catch {
    // If storage cannot be read, preserve the existing cleanup path.
  }
  return (await load()).revokeActivePairingCode()
}
